"use strict";

var rPart = /\{#([^{}]+)\}/;

function getValue( path, _data ) {
	path = path.split( "." );
	var data = _data;
	while ( data != null && path.length ) {
		data = data[ path.shift() ];
	}
	return parse( data, _data );
}

function parse( expr, data ) {
	if ( expr == null ) {
		return expr;
	}
	expr = expr + "";
	var replaced;
	function replacer( _, path ) {
		replaced = true;
		return getValue( path, data );
	}
	do {
		replaced = false;
		expr = expr.replace( rPart, replacer );
	} while ( replaced );
	return expr;
}

module.exports = {
	parse: parse,
	get: getValue
};
