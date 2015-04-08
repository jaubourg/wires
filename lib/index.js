"use strict";

var configCache = require( "./config/cache" );
var Module = require( "module" );
var path = require( "path" );

var resolveFilename = Module._resolveFilename;

var rRaw = /^::/;

Module._resolveFilename = function( request, parent ) {
	return rRaw.test( request ) ?
		resolveFilename( request.substr( 2 ), parent ) :
		configCache(
			path.dirname( parent ? parent.filename : process.cwd() )
		).handleExpression( request, parent, resolveFilename );
};
