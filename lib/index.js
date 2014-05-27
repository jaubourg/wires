"use strict";

var configCache = require( "./config/cache" );
var Module = require( "module" );
var path = require( "path" );

var oldResolveFilename = Module._resolveFilename;

var rInjection = /^:|#/;

Module._resolveFilename = function( request, parent ) {
	return rInjection.test( request ) ?
		configCache( path.dirname( parent.filename ) ).handleExpression( request, parent ) :
		oldResolveFilename( request, parent );
};
