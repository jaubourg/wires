/* eslint-disable max-lines, max-statements, no-bitwise */
"use strict";

const funcs = require( `../exportable/funcs` );
const isObject = require( `../isObject` );
const serialize = require( `../serialize-javascript` );

const FUNCS_MARKER = Symbol( `funcs marker` );
const HANDLE_ARRAY = Symbol( `handle array` );

const BOTH = 0b1100;
const CODE = 0b0101;
const VALUE = 0b1010;

const HAS_CODE = 0b0100;
const HAS_VALUE = 0b1000;

const IS_CODE = 0b0001;

class Item {
    #code;
    #keys;
    #type;
    #value;
    static [ HANDLE_ARRAY ]( list, isEntries = false ) {
        const { length } = list;
        const array = new Array( length );
        let isCode = 0;
        if ( isEntries ) {
            let doneIndex;
            for ( doneIndex = 0; !isCode && ( doneIndex < length ); ++doneIndex ) {
                const [ key, value ] = list[ doneIndex ];
                const item = Item.newValue( value );
                array[ doneIndex ] = [ key, item ];
                isCode = ( item.#type & IS_CODE );
            }
            if ( isCode ) {
                for ( let i = 0; i < doneIndex; ++i ) {
                    const arrayEntry = array[ i ];
                    arrayEntry[ 1 ] = arrayEntry[ 1 ].getRawCode();
                }
                for ( let i = doneIndex; i < length; i++ ) {
                    const [ key, value ] = list[ i ];
                    array[ i ] = [ key, Item.newValue( value ).getRawCode() ];
                }
            } else {
                for ( let i = 0; i < length; i++ ) {
                    const [ key, value ] = list[ i ];
                    array[ i ] = [ key, Item.newValue( value ).getValue() ];
                }
            }
        } else {
            let doneIndex;
            for ( doneIndex = 0; !isCode && ( doneIndex < length ); ++doneIndex ) {
                const item = Item.newValue( list[ doneIndex ] );
                array[ doneIndex ] = item;
                isCode = ( item.#type !== VALUE );
            }
            if ( isCode ) {
                for ( let i = 0; i < doneIndex; ++i ) {
                    array[ i ] = array[ i ].getRawCode();
                }
                for ( let i = doneIndex; i < length; i++ ) {
                    array[ i ] = Item.newValue( list[ i ] ).getRawCode();
                }
            } else {
                for ( let i = 0; i < length; i++ ) {
                    array[ i ] = array[ i ].getValue();
                }
            }
        }
        return {
            array,
            isCode,
        };
    }
    static newCode( code, keys ) {
        const item = new Item();
        item.#code = code;
        item.#keys = keys;
        item.#type = CODE;
        return item;
    }
    static newValue( value ) {
        if ( value instanceof Item ) {
            return value;
        }
        let code;
        let keys;
        if ( Array.isArray( value ) ) {
            const { length } = value;
            if ( length ) {
                const { array, isCode } = Item[ HANDLE_ARRAY ]( value );
                if ( isCode ) {
                    code = [ `[` ];
                    for ( let i = 0; i < length; ++i ) {
                        if ( i ) {
                            code.push( `,` );
                        }
                        code.push( ...array[ i ] );
                    }
                    code.push( `]` );
                } else {
                    // eslint-disable-next-line no-param-reassign
                    value = array;
                }
            } else {
                // eslint-disable-next-line no-param-reassign
                value = [];
            }
        } else if ( isObject( value ) ) {
            let array = Object.entries( value );
            const { length } = array;
            if ( length ) {
                const handled = Item[ HANDLE_ARRAY ]( array, true );
                ( { array } = handled );
                if ( handled.isCode ) {
                    code = [ `{` ];
                    keys = array;
                    for ( let i = 0; i < length; ++i ) {
                        const [ key, itemCode ] = array[ i ];
                        keys[ i ] = key;
                        if ( i ) {
                            code.push( `,` );
                        }
                        code.push( JSON.stringify( key ), `:`, ...itemCode );
                    }
                    code.push( `}` );
                } else {
                    keys = true;
                    // eslint-disable-next-line no-param-reassign
                    value = Object.fromEntries( array );
                }
            } else {
                // eslint-disable-next-line no-param-reassign
                value = {};
            }
        }
        if ( code ) {
            return Item.newCode( code, keys );
        }
        const item = new Item();
        item.#keys = keys;
        item.#type = VALUE;
        item.#value = value;
        return item;
    }
    getCode( funcsName ) {
        return this.getRawCode().map( v => ( ( v === FUNCS_MARKER ) ? funcsName : v ) ).join( `` );
    }
    getKeys() {
        if ( this.#keys === true ) {
            this.#keys = Object.keys( this.#value );
        }
        return this.#keys;
    }
    getRawCode() {
        if ( !( this.#type & HAS_CODE ) ) {
            this.#code = [
                serialize( this.#value, {
                    "unsafe": true,
                } ),
            ];
            this.#type |= BOTH;
        }
        return this.#code;
    }
    getValue() {
        if ( !( this.#type & HAS_VALUE ) ) {
            // eslint-disable-next-line no-eval
            this.#value = eval( `(($)=>(${ this.getCode( `$` ) }))` )( funcs );
            this.#type |= BOTH;
        }
        return this.#value;
    }
    isCode() {
        return ( this.#type & IS_CODE );
    }
}

const factory = ( func, name ) => ( ...args ) => {
    if ( !args.length ) {
        return Item.newValue( func() );
    }
    const item = Item.newValue( args );
    return item.isCode() ?
        Item.newCode( [ FUNCS_MARKER, `.${ name }(`, ...( item.getRawCode().slice( 1, -1 ) ), `)` ] ) :
        Item.newValue( func( ...( item.getValue() ) ) );
};

{
    const specials = new Map( [
        [
            `getEnv`,
            getEnv => {
                Object.defineProperty( Item.prototype, `getEnv`, {
                    value( asCode = false ) {
                        return getEnv( asCode ? Item.newCode( this.getRawCode() ) : this );
                    },
                } );
            },
        ],
        [
            `join`,
            join => {
                Item.join = join;
            },
        ],
    ] );

    const normal = ( func, name ) => {
        Object.defineProperty( Item.prototype, name, {
            value( ...args ) {
                return func( this, ...args );
            },
        } );
    };

    for ( const [ name, func ] of Object.entries( funcs ) ) {
        ( specials.get( name ) || normal )( factory( func, name ), name );
    }
}

module.exports = {
    "joinItems": Item.join,
    "newValue": Item.newValue,
};
