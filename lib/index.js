"use strict";

var configCache = require( "./config/cache" );
var Module = require( "module" );
var path = require( "path" );

var oldResolveFilename = Module._resolveFilename;

function resolveInjection( expr, parent ) {
	var dirname = path.dirname( parent.filename );
	var config = configCache( dirname );
	expr = config.parse( expr );
	if ( expr[ 0 ] === ":" ) {
		return config.route( expr );
	} else if ( expr[ 0 ] === "#" ) {
		var filename = ( config.module ? config.module.filename : dirname ) + expr;
		if ( !Module._cache[ filename ] ) {
			var module = Module._cache[ filename ] = new Module( filename, config.module || parent );
			module.filename = filename;
			module.exports = config.value( expr.substr( 1 ) );
			module.loaded = true;
		}
		return filename;
	} else {
		return Module._resolveFilename( expr, parent );
	}
}

var rInjection = /^:|#/;

Module._resolveFilename = function( request, parent ) {
	return rInjection.test( request ) ?
		configCache( path.dirname( parent.filename ) ).handleExpression( request ) :
		oldResolveFilename( request, parent );
};
