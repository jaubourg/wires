"use strict";

const { dirname, join } = require( `path` );
const { homedir } = require( `os` );

const rBoolean = /^\s*(?:false|(true))\s*$/;

const cwd = process.cwd();
const { env } = process;

const empty = new Set( [ ``, null, undefined ] );

module.exports = {
    "castBoolean": v => {
        const tmp = rBoolean.exec( String( v ) );
        return tmp ? Boolean( tmp[ 1 ] ) : null;
    },
    "castJSON": v => {
        try {
            return JSON.parse( v );
        } catch ( _ ) {
            return null;
        }
    },
    "castNumber": v => {
        const sv = String( v ).trim();
        return sv ? Number( sv ) : NaN;
    },
    "castString": String,
    "fallback": ( v, e ) => ( ( empty.has( v ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v ),
    "getEnv": v => ( v ? env[ v ] : env ),
    "inCWD": v => join( cwd, String( v ) ),
    "inDir": ( v, dir ) => join( dir, String( v ) ),
    "inHome": v => join( homedir(), String( v ) ),
    "inParentDir": ( v, dir ) => join( dirname( dir ), String( v ) ),
    "join": ( ...v ) => v.join( `` ),
};
