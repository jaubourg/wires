"use strict";

const { homedir } = require( `os` );
const { resolve } = require( `path` );

const rBoolean = /^(?:false|(true))$/;
const rDir = /\/$/;

module.exports = {
    "castBoolean": v => {
        if ( typeof v === `boolean` ) {
            return v;
        }
        const tmp = rBoolean.exec( String( v ).trim() );
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
    "fallback":
        ( v, e ) => ( ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v ),
    "getEnv": v => ( v ? process.env[ v ] : process.env ),
    "inCWD": v => {
        const sv = String( v );
        const tmp = resolve( process.cwd(), sv );
        return rDir.test( sv ) ? `${ tmp }/` : tmp;
    },
    "inDir": ( v, dir ) => {
        const sv = String( v );
        const tmp = resolve( dir, sv );
        return rDir.test( sv ) ? `${ tmp }/` : tmp;
    },
    "inHome": v => {
        const sv = String( v );
        const tmp = resolve( homedir(), sv );
        return rDir.test( sv ) ? `${ tmp }/` : tmp;
    },
    "inParentDir": ( v, dir ) => {
        const sv = String( v );
        const tmp = resolve( dir, `..`, sv );
        return rDir.test( sv ) ? `${ tmp }/` : tmp;
    },
    "join": ( ...v ) => v.join( `` ),
};
