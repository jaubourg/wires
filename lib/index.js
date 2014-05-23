"use strict";

var configCache = require( "./config/cache" );
var configValue = require( "./config/value" );
var Module = require( "module" );
var path = require( "path" );

var oldResolveFilename = Module._resolveFilename;

function getRoute( expr, compiled, config, data ) {
	if ( !config.routes[ compiled ] ) {
		if ( config.routes[ expr ] ) {
			var tmp = Module._resolveFilename( configValue.parse( config.routes[ expr ], data ), config.module );
			if ( data !== config.data ) {
				return tmp;
			}
			config.routes[ compiled ] = tmp;
		} else if ( config.parent ) {
			config.routes[ compiled ] = getRoute( expr, compiled, config.parent, data );
		} else {
			throw new Error( "Unknown route '" + expr + "'" );
		}
	}
	return config.routes[ compiled ];
}

function resolveInjection( expr, parent ) {
	var dirname = path.dirname( parent.filename );
	var config = configCache( dirname );
	expr = configValue.parse( expr, config.data );
	if ( expr[ 0 ] === ":" ) {
		return getRoute( expr, ">" + expr.substr( 1 ), config, config.data );
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
