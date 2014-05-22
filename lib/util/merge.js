"use strict";

var merge = require( "lodash" ).merge;

function noArray( a, b ) {
	if ( Array.isArray( a ) && Array.isArray( b ) ) {
		return b;
	}
}

module.exports = function() {
	var output = {};
	for( var i = 0; i < arguments.length; i++ ) {
		if ( arguments[ i ] ) {
			output = merge( output, arguments[ i ], noArray );
		}
	}
	return output;
};
