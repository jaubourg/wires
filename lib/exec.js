"use strict";

function requireMain( expression ) {
	var Module = require( "module" );
	var _load = Module._load;
	Module._load = function( request ) {
		Module._load = _load;
		_load( request, null, true );
	};
	require( expression );
}

module.exports = function( argv ) {
	process.argv = argv;
	process.execArgv = process.execArgv.slice( 0, -2 );
	require( "./index" );
	requireMain( argv[ 1 ] );
};
