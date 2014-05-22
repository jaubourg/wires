"use strict";

var r_part = /\{#([^{}]+)\}/;

function getValue( path, _data ) {
	path = path.split( "." );
	var data = _data;
	while( data != null && path.length ) {
		data = data[ path.shift() ];
	}
	return parse( data, _data );
}

function parse( expr, data ) {
	if ( !expr ) {
		return expr;
	}
	expr = expr + "";
	var replaced;
	do {
		replaced = false;
		expr = expr.replace( r_part, function( _, path ) {
			replaced = true;
			return getValue( path, data );
		} );
	} while( replaced );
	return expr;
}

module.exports = parse;
