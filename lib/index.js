"use strict";

var configCache = require( "./config/cache" );
var Module = require( "module" );
var path = require( "path" );
var parseConfigValue = require( "./config/parseConfigValue" );

var oldResolveFilename = Module._resolveFilename;

function getRoute( expr, compiled, config, data ) {
	if ( !config.routes[ compiled ] ) {
		if ( config.routes[ expr ] ) {
			var tmp = Module._resolveFilename( parseConfigValue( config.routes[ expr ], data ), config.module );
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
	expr = parseConfigValue( expr, config.data );
	if ( expr[ 0 ] === ":" ) {
		return getRoute( expr, ">" + expr.substr( 1 ), config, config.data );
	} else if ( expr[ 0 ] === "#" ) {
		var filename = ( config.module ? config.module.filename : dirname ) + expr;
		if ( !Module._cache[ filename ] ) {
			var module = Module._cache[ filename ] = new Module( filename, config.module || parent );
			module.filename = filename;
			module.exports = parseConfigValue( "{" + expr + "}", config.data );
			module.loaded = true;
		}
		return filename;
	} else {
		return Module._resolveFilename( expr, parent );
	}
};

var r_injection = /^:|#/;

Module._resolveFilename = function( request, parent ) {
	if ( r_injection.test( request ) ) {
		return resolveInjection( request, parent );
	}
	return oldResolveFilename( request, parent );
};
