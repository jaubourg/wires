"use strict";

var _ = require( "lodash" );
var cashe = require( "cashe" );
var merge = require( "./../util/merge");
var path = require( "path" );
var requireIfExists = require( "./../util/requireIfExists" );

var getFor = module.exports = cashe( function( dir ) {
	return handleFiles( dir, {
		main: "",
		env: process.env.WIRES ? ( "." + process.env.WIRES ) : undefined,
		defaults: "-defaults",
		envDefaults: process.env.WIRES ? ( "-defaults." + process.env.WIRES ) : undefined
	}, function( configs, parent, module ) {
		var config = {
			module: module,
			parent: parent
		};
		split(
			configs.main,
			split(
				configs.env,
				config
			)
		);
		if ( parent ) {
			config.data = merge( {}, parent.data, config.data );
		}
		split(
			configs.defaults,
			split(
				configs.envDefaults,
				config
			)
		);
		if ( !config.data ) {
			config.data = {};
		}
		if ( !config.routes ) {
			config.routes = {};
		}
		return config;
	} );
} );

function split( source, dest ) {
	if ( !source ) {
		return dest;
	}
	var routes = {};
	var data = {};
	_.forOwn( source, function( value, key ) {
		( key[ 0 ] === ":" ? routes : data )[ key ] = value;
	} );
	dest.routes = dest.routes ? _.defaults( dest.routes, routes ) : routes;
	dest.data = dest.data ? merge( data, dest.data ) : data;
	return dest;
}

function handleFiles( dir, files, callback ) {
	var parent = path.dirname( dir );
	parent = parent && parent !== dir && getFor( parent );
	var _module;
	return callback( _.mapValues( files, function( filename ) {
		if ( filename == null ) {
			return undefined;
		}
		filename = path.resolve( dir, "wires" + filename + ".json" );
		var module = requireIfExists( filename );
		if ( !_module ) {
			_module = require.cache[ filename ];
		}
		return module;
	} ), parent, _module || parent && parent.module );
}
