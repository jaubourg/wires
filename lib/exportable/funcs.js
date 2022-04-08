"use strict";

const { dirname, join } = require( `path` );

const rBoolean = /^\s*(?:false|(true))\s*$/;

const cwd = process.cwd();
const { env } = process;
const homedir = require( `os` ).homedir();

const empty = new Set( [ ``, null, undefined ] );

module.exports = {
    "castBoolean": v => {
        if ( typeof v === `boolean` ) {
            return v;
        }
        const tmp = rBoolean.exec( String( v ) );
        return tmp ? Boolean( tmp[ 1 ] ) : null;
    },
    "castNumber": v => {
        if ( typeof v === `number` ) {
            return v;
        }
        const sv = String( v ).trim();
        return sv ? Number( sv ) : NaN;
    },
    "castString": String,
    "fallback": ( v, e ) => ( ( empty.has( v ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v ),
    "getEnv": v => ( v ? env[ v ] : env ),
    "inCWD": v => join( cwd, String( v ) ),
    "inDir": ( v, dir ) => join( dir, String( v ) ),
    "inHome": v => join( homedir, String( v ) ),
    "inParentDir": ( v, dir ) => join( dirname( dir ), String( v ) ),
    "join": ( ...v ) => v.join( `` ),
};
