/* eslint-disable no-param-reassign */
"use strict";

const os = require( `os` );
const path = require( `path` );
const serialize = require( `../../serialize-javascript` );

class Code {
    #code;
    constructor( code ) {
        // eslint-disable-next-line no-nested-ternary
        this.#code = code;
    }
    toString() {
        return this.#code;
    }
}

const isCode = v => v instanceof Code;

const asCode = v => ( isCode( v ) ? String : serialize )( v );

const execute = ( { type, value } ) => {
    if ( isCode( value ) ) {
        const code = value.toString;
        return {
            code,
            type,
            // eslint-disable-next-line no-eval
            "value": eval( `(${ code })` ),
        };
    }
    return {
        type,
        value,
    };
};

const _argsHaveCode = args => {
    for ( const arg of args ) {
        if ( isCode( arg ) ) {
            return true;
        }
    }
    return false;
};
const factory = f => ( ...args ) => (
    _argsHaveCode( args ) ? new Code(
        `(${ f })(${ args.map( arg => ( isCode( arg ) ? arg.toString() : serialize( arg ) ) ).join( `,` ) })`
    ) : f( ...args )
);
const castBoolean = factory( s => ( ( s = String( s ).trim() ) === `true` ) || ( s === `false` ? false : null ) );
const castNumber = factory( s => ( ( ( s = String( s ).trim() ) ) ? Number( s ) : NaN ) );
const castString = factory( v => String( v ) );
const empty = factory(
    ( v, e ) => ( ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v )
);
const _getEnv = factory( v => ( v ? process.env[ v ] : process.env ) );
const getEnv = ( v, code ) => _getEnv( isCode( v ) || !code ? v : new Code( serialize( v ) ) );
const join = factory( ( ...items ) => items.join( `` ) );

const needsFallback = v => ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) );

// eslint-disable-next-line no-shadow
const requireDependant = ( require => ( {
    "inCWD": factory( v => {
        const sv = String( v );
        const tmp = require( `path` ).resolve( process.cwd(), sv.replace( /^\//, `` ) );
        return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
    } ),
    "inDir": factory( ( dir, v ) => {
        const sv = String( v );
        const tmp = require( `path` ).resolve( dir, sv );
        return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
    } ),
    "inHome": factory( v => {
        const sv = String( v );
        const tmp = require( `path` ).resolve( require( `os` ).homedir(), sv.replace( /^\//, `` ) );
        return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
    } ),
    "inParentDir": factory( ( dir, v ) => {
        const { dirname, resolve } = require( `path` );
        const sv = String( v );
        const tmp = resolve( dirname( dir ), sv );
        return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
    } ),
} ) )( ( modules => expr => modules[ expr ] )( {
    os,
    path,
} ) );

module.exports = {
    castBoolean,
    castNumber,
    castString,
    empty,
    execute,
    getEnv,
    asCode,
    isCode,
    join,
    needsFallback,
    ...requireDependant,
};
