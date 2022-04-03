"use strict";

const addToObject = ( start, key, value ) => {
    let current = start;
    let last;
    for ( const part of key.split( `.` ) ) {
        if ( last ) {
            if ( !current.hasOwnProperty( last ) ) {
                current[ last ] = {};
            }
            current = current[ last ];
        }
        last = part;
    }
    current[ last ] = value;
}

const rFlag = /^(!?)(.*)$/;
const rOverride = /^\([^)]*\)$/;
const rQuote = /^'(.*)'$/g;
const rSet = /^([^=]+)=(.*)$/;

const commandLineOverride = argv => {
    const data = {};
    const filteredArgv = argv.filter( arg => {
        if ( !rOverride.test( arg ) ) {
            return true;
        }
        for ( const expr of arg.slice( 1, -1 ).split( `,` ) ) {
            if ( expr ) {
                let test;
                let key;
                let value;
                if ( ( test = rSet.exec( expr ) ) ) {
                    [ , key, value ] = test;
                    try {
                        value = JSON.parse( value.replace( rQuote, `"$1"` ) );
                    } catch ( e ) {}
                } else {
                    [ , value, key ] = rFlag.exec( expr );
                    value = !value;
                }
                if ( key ) {
                    addToObject( data, key, value );
                }
            }
        }
        return false;
    } );
    commandLineOverride.data = data;
    return filteredArgv;
};

module.exports = commandLineOverride;
