"use strict";

var configCache = require( "./config/cache" );
var Module = require( "module" );
var path = require( "path" );

var resolveFilename = Module._resolveFilename;

var rRaw = /^::/;

Module._resolveFilename = function( request, parent ) {
	if ( rRaw.test( request ) ) {
		return resolveFilename( request.substr( 2 ), parent );
	}
	return configCache( path.dirname( parent.filename ) ).handleExpression( request, parent, resolveFilename );
};
