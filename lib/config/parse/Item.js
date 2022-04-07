"use strict";

const isObject = require( `../../isObject` );
const serialize = require( `../../serialize-javascript` );

const HANDLE_ARRAY = Symbol( `handle array` );

class Item {
    #data;
    static [ HANDLE_ARRAY ]( list ) {
        let isCode = false;
        return {
            "array":
                list
                    .map( itemOrValue => {
                        const item = ( itemOrValue instanceof Item ) ? itemOrValue : Item.newValue( itemOrValue );
                        if ( !isCode ) {
                            isCode = !item.hasValue();
                        }
                        return item;
                    } )
                    .map(
                        isCode ?
                            ( item => item.getCode() ) :
                            ( item => item.getValue() )
                    ),
            isCode,
        };
    }
    static newCode( code ) {
        const item = new Item();
        item.#data.set( `code`, code );
        return item;
    }
    static newValue( value ) {
        if ( value instanceof Item ) {
            return value;
        }
        const item = new Item();
        let code;
        if ( Array.isArray( value ) ) {
            const { array, isCode } = Item[ HANDLE_ARRAY ]( value );
            if ( isCode ) {
                code = `[${ array.join( `,` ) }]`;
            } else {
                // eslint-disable-next-line no-param-reassign
                value = array;
            }
        } else if ( isObject( value ) ) {
            const values = Object.values( value );
            const { array, isCode } = Item[ HANDLE_ARRAY ]( values );
            if ( isCode ) {
                code = `{${
                    Object.keys( value )
                        .map( ( k, i ) => `${ JSON.stringify( k ) }:${ array[ i ] }` )
                        .join( `,` )
                }}`;
            } else {
                // eslint-disable-next-line no-param-reassign
                value = Object.fromEntries(
                    Object.keys( value ).map( ( k, i ) => [ k, array[ i ] ] )
                );
            }
        }
        if ( code ) {
            item.#data.set( `code`, code );
        } else {
            item.#data.set( `value`, value );
        }
        return item;
    }
    constructor() {
        this.#data = new Map();
    }
    getCode() {
        if ( !this.#data.has( `code` ) ) {
            this.#data.set( `code`, serialize( this.#data.get( `value` ) ) );
        }
        return this.#data.get( `code` );
    }
    getValue() {
        if ( !this.#data.has( `value` ) ) {
            // eslint-disable-next-line no-eval
            this.#data.set( `value`, eval( `(${ this.#data.get( `code` ) })` ) );
        }
        return this.#data.get( `value` );
    }
    hasCode() {
        return this.#data.has( `code` );
    }
    hasValue() {
        return this.#data.has( `value` );
    }
}

const factory = ( func, overrideCode ) => {
    const code = `(${ overrideCode || func })`;
    return ( ...args ) => {
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

Object.assign( Item.prototype, {
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
} );

// eslint-disable-next-line no-shadow
Object.assign( Item.prototype, ( require => ( {
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
} ) ) );

module.exports = Item;
