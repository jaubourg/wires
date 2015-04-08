"use strict";

var commandLineTest = require( "./helper/commandLineTest" );
var path = require( "path" );

module.exports = {
	"full_test": commandLineTest( [
		process.execPath,
		path.resolve( __dirname + "/../bin/wires" ),
		"(object.a=1)",
		"--throw-deprecation",
		__dirname + "/data/script.js"
	], function( __, stdout, stderr, exitCode ) {
		__.expect( 2 );
		__.strictEqual( exitCode, 180, "correct exit code (1204)" );
		__.deepEqual( JSON.parse( stderr ), {
			noParent: true,
			isMain: true,
			argv: [
				path.resolve( __dirname + "/../bin/wires" ),
				path.resolve( __dirname + "/data/script.js" )
			],
			execArgv: [
				"--throw-deprecation"
			],
			config: {
				string: "value",
				object: {
					a: 1,
					b: "b",
					c: "c"
				}
			}
		}, "everything has been properly transmitted" );
		__.done();
	}, path.resolve( __dirname, "data" ) )
};
