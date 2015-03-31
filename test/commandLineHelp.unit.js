"use strict";

var commandLineTest = require( "./helper/commandLineTest" );

var helpString =
	require( "fs" ).readFileSync( __dirname + "/../data/help.txt" ).toString()
		.replace( /ENGINE/g, "some_exe" ) + "\n";

module.exports = {
	"short": commandLineTest( [
		"some_exe",
		"script.js",
		"-h"
	], function( __, stdout, stderr, exitCode ) {
		__.expect( 3 );
		__.strictEqual( stdout, helpString, "help string properly created" );
		__.strictEqual( stderr, "", "nothing on stderr" );
		__.strictEqual( exitCode, 0, "exit code is 0" );
		__.done();
	} ),
	"long": commandLineTest( [
		"some_exe",
		"script.js",
		"--help"
	], function( __, stdout, stderr, exitCode ) {
		__.expect( 3 );
		__.strictEqual( stdout, helpString, "help string properly created" );
		__.strictEqual( stderr, "", "nothing on stderr" );
		__.strictEqual( exitCode, 0, "exit code is 0" );
		__.done();
	} ),
	"short circuit": commandLineTest( [
		"some_exe",
		"script.js",
		"-h",
		"someScript.js"
	], function( __, stdout, stderr, exitCode ) {
		__.expect( 3 );
		__.strictEqual( stdout, helpString, "help string properly created" );
		__.strictEqual( stderr, "", "nothing on stderr" );
		__.strictEqual( exitCode, 0, "exit code is 0" );
		__.done();
	} )
};
