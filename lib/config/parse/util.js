/* eslint-disable no-param-reassign */
"use strict";

const os = require( `os` );
const path = require( `path` );
const serialize = require( `serialize-javascript` );

const CODE = Symbol( `code` );

const isCode = v => Boolean( v && v[ CODE ] );

const _argsHaveCode = args => {
    for ( const arg of args ) {
        if ( isCode( arg ) ) {
            return true;
        }
    }
    return false;
};
const factory = f => ( ...args ) => (
    _argsHaveCode( args ) ? {
        [ CODE ]:
            `( ${ f } )( ${ args.map( arg => ( ( arg && arg[ CODE ] ) || serialize( arg ) ) ).join( `, ` ) } )`,
    } : f( ...args )
);
const castBoolean = factory( s => ( ( s = String( s ).trim() ) === `true` ) || ( s === `false` ? false : null ) );
const castNumber = factory( s => ( ( ( s = String( s ).trim() ) ) ? Number( s ) : NaN ) );
const castString = factory( v => String( v ) );
const empty = factory(
    ( v, e ) => ( ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v )
);
const _getEnv = factory( v => ( v ? process.env[ v ] : process.env ) );
const getEnv = ( v, asCode ) => _getEnv( ( v && v[ CODE ] ) || !asCode ? v : {
    [ CODE ]: serialize( v ),
} );
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

const execute = ( { type, value } ) => ( isCode( value ) ? {
    "code": value[ CODE ],
    type,
    // eslint-disable-next-line no-eval
    "value": eval( value[ CODE ] ),
} : {
    type,
    value,
} );

module.exports = Object.assign( {
    castBoolean,
    castNumber,
    castString,
    empty,
    execute,
    getEnv,
    isCode,
    join,
    needsFallback,
}, requireDependant );
