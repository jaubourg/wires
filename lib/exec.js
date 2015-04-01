"use strict";

module.exports = function( argv ) {
	process.argv = argv;
	process.execArgv = process.execArgv.slice( 0, -2 );
	require( "./index" );
	require( argv[ 1 ] );
};
