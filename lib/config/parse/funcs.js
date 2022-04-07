"use strict";

const { homedir } = require( `os` );
const { resolve } = require( `path` );

const rBoolean = /^(?:false|(true))$/;
const rDir = /\/$/;

const castBoolean = v => {
    if ( typeof v === `boolean` ) {
        return v;
    }
    const tmp = rBoolean.exec( String( v ).trim() );
    return tmp ? Boolean( tmp[ 1 ] ) : null;
};

const castNumber = v => {
    if ( typeof v === `number` ) {
        return v;
    }
    const sv = String( v ).trim();
    return sv ? Number( sv ) : NaN;
};

const castString = String;

const fallback =
        ( v, e ) => ( ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v );

const getEnv = v => ( v ? process.env[ v ] : process.env );

const inCWD = v => {
    const sv = String( v );
    const tmp = resolve( process.cwd(), sv );
    return rDir.test( sv ) ? `${ tmp }/` : tmp;
};

const inDir = ( v, dir ) => {
    const sv = String( v );
    const tmp = resolve( dir, sv );
    return rDir.test( sv ) ? `${ tmp }/` : tmp;
};

const inHome = v => {
    const sv = String( v );
    const tmp = resolve( homedir(), sv );
    return rDir.test( sv ) ? `${ tmp }/` : tmp;
};

const inParentDir = ( v, dir ) => {
    const sv = String( v );
    const tmp = resolve( dir, `..`, sv );
    return rDir.test( sv ) ? `${ tmp }/` : tmp;
};

const join = ( ...v ) => v.join( `` );

module.exports = {
    castBoolean,
    castNumber,
    castString,
    fallback,
    getEnv,
    inCWD,
    inDir,
    inHome,
    inParentDir,
    join,
};
