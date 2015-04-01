"use strict";

module.exports = function( wiresPath, scriptPath ) {
	process.argv[ 0 ] = wiresPath;
	process.argv.splice( 1, 0, scriptPath );
	process.execArgv = process.execArgv.slice( 0, -2 );
	require( "./index" );
	require( scriptPath );
};
