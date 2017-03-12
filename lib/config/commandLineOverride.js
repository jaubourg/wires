"use strict";

function addToObject( start, key, value ) {
    let current = start;
    let last;
    for ( let part of key.split( `.` ) ) {
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

module.exports = argv => {
    const data = {};
    return {
        "argv": argv.filter( arg => {
            if ( !rOverride.test( arg ) ) {
                return true;
            }
            for ( let expr of arg.slice( 1, -1 ).split( `,` ) ) {
                if ( expr ) {
                    let test;
                    let key;
                    let value;
                    if ( ( test = rSet.exec( expr ) ) ) {
                        key = test[ 1 ];
                        try {
                            value = JSON.parse( test[ 2 ].replace( rQuote, `"$1"` ) );
                        } catch ( e ) {
                            value = test[ 2 ];
                        }
                    } else if ( ( test = rFlag.exec( expr ) ) ) {
                        key = test[ 2 ];
                        value = !test[ 1 ];
                    }
                    if ( test ) {
                        addToObject( data, key, value );
                    }
                }
            }
            return false;
        } ),
        data,
    };
};
