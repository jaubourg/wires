"use strict";

var merge = require( "lodash" ).mergeWith;

function noArray( a, b ) {
    if ( Array.isArray( a ) && Array.isArray( b ) ) {
        return b;
    }
    return undefined;
}

module.exports = function() {
    var output = {};
    var i;
    for ( i = 0; i < arguments.length; i++ ) {
        if ( arguments[ i ] ) {
            output = merge( output, arguments[ i ], noArray );
        }
    }
    return output;
};
