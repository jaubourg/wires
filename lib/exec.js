"use strict";

module.exports = function( wiresPath, scriptPath, args ) {
	process.argv = [ wiresPath, scriptPath ].concat( args );
	process.execArgv = process.execArgv.slice( 0, -2 );
	require( "./index" );
	require( scriptPath );
};
