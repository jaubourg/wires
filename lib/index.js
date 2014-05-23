"use strict";

var configCache = require( "./config/cache" );
var configValue = require( "./config/value" );
var Module = require( "module" );
var path = require( "path" );

var oldResolveFilename = Module._resolveFilename;

function getRoute( expr, config, data ) {
	if ( config.routes[ expr ] ) {
		return Module._resolveFilename( configValue.parse( config.routes[ expr ], data ), config.module );
	}
	if ( config.parent ) {
		return getRoute( expr, config.parent, data );
	}
	throw new Error( "Unknown route '" + expr + "'" );
}

function resolveInjection( expr, parent ) {
	var dirname = path.dirname( parent.filename );
	var config = configCache( dirname );
	expr = configValue.parse( expr, config.data );
	if ( expr[ 0 ] === ":" ) {
		return getRoute( expr, config, config.data );
	} else if ( expr[ 0 ] === "#" ) {
		var filename = ( config.module ? config.module.filename : dirname ) + expr;
		if ( !Module._cache[ filename ] ) {
			var module = Module._cache[ filename ] = new Module( filename, config.module || parent );
			module.filename = filename;
			module.exports = configValue.get( expr.substr( 1 ), config.data );
			module.loaded = true;
		}
		return filename;
	} else {
		return Module._resolveFilename( expr, parent );
	}
}

var rInjection = /^:|#/;

Module._resolveFilename = function( request, parent ) {
	if ( rInjection.test( request ) ) {
		return resolveInjection( request, parent );
	}
	return oldResolveFilename( request, parent );
};
