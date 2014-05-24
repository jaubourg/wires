"use strict";

var _ = require( "lodash" );
var cashe = require( "cashe" );
var Config = require( "./Config" );
var path = require( "path" );
var requireIfExists = require( "./../util/requireIfExists" );

var getFor = module.exports = cashe( function( dir ) {
	var parent = path.dirname( dir );
	parent = parent && parent !== dir && getFor( parent );
	var module;
	var rawFiles = _.mapValues( {
		main: "",
		env: process.env.WIRES ? ( "." + process.env.WIRES ) : undefined,
		defaults: "-defaults",
		envDefaults: process.env.WIRES ? ( "-defaults." + process.env.WIRES ) : undefined
	}, function( filename ) {
		if ( filename == null ) {
			return;
		}
		filename = path.resolve( dir, "wires" + filename + ".json" );
		var required = requireIfExists( filename );
		if ( !module ) {
			module = require.cache[ filename ];
		}
		return required;
	} );
	return new Config( dir, module, parent, rawFiles );
} );
