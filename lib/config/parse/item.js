"use strict";

const isObject = require( `../../isObject` );
const serialize = require( `../../serialize-javascript` );

const HANDLE_ARRAY = Symbol( `handle array` );

const BOTH = 0;
const CODE = 1;
const VALUE = 2;

class Item {
    #code;
    #type;
    #value;
    // eslint-disable-next-line max-statements
    static [ HANDLE_ARRAY ]( list, isEntries = false ) {
        const { length } = list;
        const array = new Array( length );
        let isCode = false;
        if ( isEntries ) {
            let doneIndex;
            for ( doneIndex = 0; !isCode && ( doneIndex < length ); ++doneIndex ) {
                const [ key, value ] = list[ doneIndex ];
                const item = Item.newValue( value );
                array[ doneIndex ] = [ key, item ];
                isCode = ( item.#type !== VALUE );
            }
            if ( isCode ) {
                for ( let i = 0; i < doneIndex; ++i ) {
                    const arrayEntry = array[ i ];
                    arrayEntry[ 1 ] = arrayEntry[ 1 ].getCode();
                }
                for ( let i = doneIndex; i < length; i++ ) {
                    const [ key, value ] = list[ i ];
                    array[ i ] = [ key, Item.newValue( value ).getCode() ];
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
                    array[ i ] = array[ i ].getCode();
                }
                for ( let i = doneIndex; i < length; i++ ) {
                    array[ i ] = Item.newValue( list[ i ] ).getCode();
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
    static newCode( code ) {
        const item = new Item();
        item.#type = CODE;
        item.#code = code;
        return item;
    }
    static newValue( value ) {
        if ( value instanceof Item ) {
            return value;
        }
        let code;
        if ( Array.isArray( value ) ) {
            const { length } = value;
            if ( length ) {
                const { array, isCode } = Item[ HANDLE_ARRAY ]( value );
                if ( isCode ) {
                    code = `[${ array.join( `,` ) }]`;
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
                    for ( let i = 0; i < length; ++i ) {
                        const [ key, itemCode ] = array[ i ];
                        array[ i ] = `${ JSON.stringify( key ) }:${ itemCode }`;
                    }
                    code = `{${ array.join( `,` ) }}`;
                } else {
                    // eslint-disable-next-line no-param-reassign
                    value = Object.fromEntries( array );
                }
            } else {
                // eslint-disable-next-line no-param-reassign
                value = {};
            }
        }
        if ( code ) {
            return Item.newCode( code );
        }
        const item = new Item();
        item.#type = VALUE;
        item.#value = value;
        return item;
    }
    getCode() {
        if ( this.#type === VALUE ) {
            this.#code = serialize( this.#value );
            this.#type = BOTH;
        }
        return this.#code;
    }
    getValue() {
        if ( this.#type === CODE ) {
            this.#type = BOTH;
            // eslint-disable-next-line no-eval
            this.#value = eval( `(${ this.#code })` );
        }
        return this.#value;
    }
}

const factory = ( func, overrideCode ) => {
    const code = `(${ overrideCode || func })`;
    return ( ...args ) => {
        if ( !args.length ) {
            return Item.newValue( func() );
        }
        const { array, isCode } = Item[ HANDLE_ARRAY ]( args );
        return isCode ?
            Item.newCode( `${ code }(${ array.join( `,` ) } )` ) :
            Item.newValue( func( ...array ) );
    };
};

Item.join = factory( ( ...v ) => v.join( `` ) );

const methodFactory = ( func, overrideCode ) => {
    const methodFunc = factory( func, overrideCode );
    return function( ...args ) {
        // eslint-disable-next-line no-invalid-this
        return methodFunc( this, ...args );
    };
};

const getEnv = factory( v => ( v ? process.env[ v ] : process.env ) );

Object.defineProperties( Item.prototype, Object.fromEntries( Object.entries( {
    "castBoolean": methodFactory(
        // eslint-disable-next-line no-param-reassign
        v => ( /\s*(?:false|true)\s*$/.test( ( v = `${ v }` ) ) ? JSON.parse( v ) : null )
    ),
    "castNumber": methodFactory(
        // eslint-disable-next-line no-param-reassign
        v => ( ( ( v = String( v ).trim() ) ) ? Number( v ) : NaN )
    ),
    "castString": methodFactory( String, `String` ),
    "fallback": methodFactory(
        ( v, e ) => ( ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v )
    ),
    getEnv( asCode = false ) {
        return getEnv( asCode ? Item.newCode( this.getCode() ) : this );
    },
    // eslint-disable-next-line no-shadow
    ...( require => ( {
        "inCWD": methodFactory( v => {
            const sv = String( v );
            const tmp = require( `path` ).resolve( process.cwd(), sv );
            return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
        } ),
        "inDir": methodFactory( ( v, dir ) => {
            const sv = String( v );
            const tmp = require( `path` ).resolve( dir, sv );
            return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
        } ),
        "inHome": methodFactory( v => {
            const sv = String( v );
            const tmp = require( `path` ).resolve( require( `os` ).homedir(), sv );
            return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
        } ),
        "inParentDir": methodFactory( ( v, dir ) => {
            const sv = String( v );
            const tmp = require( `path` ).resolve( dir, `..`, sv );
            return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
        } ),
    } ) )( ( modules => expr => modules[ expr ] )( {
        "os": require( `os` ),
        "path": require( `path` ),
    } ) ),
} ).map(
    ( [ name, value ] ) => [
        name,
        {
            value,
        },
    ]
) ) );

module.exports = {
    "joinItems": Item.join,
    "newCode": Item.newCode,
    "newValue": Item.newValue,
};
