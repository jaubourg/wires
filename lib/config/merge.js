"use strict";

const merge = require( `lodash` ).mergeWith;

const noArray = ( a, b ) => {
    if ( Array.isArray( a ) && Array.isArray( b ) ) {
        return b;
    }
    return undefined;
};

module.exports = function() {
    let output = {};
    for ( const argument of arguments ) {
        if ( argument ) {
            output = merge( output, argument, noArray );
        }
    }
    return output;
};
