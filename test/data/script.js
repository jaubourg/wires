"use strict";

process.chdir( __dirname );

console.error( JSON.stringify( {
	argv: process.argv,
	execArgv: process.execArgv,
	config: require( "#" )
} ) );

process.exit( 1204 );
