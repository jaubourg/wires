"use strict";

module.exports = {
	"wires.json": {
		"path": "./lib",
		"resolvedPath": "@/lib",
		"resolvedCMDPath": ">/lib",
		":resolvedRoute": "@/lib/test"
	},
	"resolvedPath.unit.js": function() {

		var path = require( "path" );

		module.exports = {
			test: function( __ ) {
				__.expect( 4 );
				__.strictEqual( require( "#path" ), "./lib" );
				__.strictEqual( require( "#resolvedPath" ), path.resolve( __dirname, "./lib" ) );
				__.strictEqual( require( "#resolvedCMDPath" ), path.resolve( process.cwd(), "./lib" ) );
				__.strictEqual( require( ":resolvedRoute" ), "lib/test" );
				__.done();
			}
		};

	},
	"/lib": {
		"test.js": function() {

			module.exports = "lib/test";

		},
		"resolvedPathSub.unit.js": function() {

			var path = require( "path" );

			module.exports = {
				test: function( __ ) {
					__.expect( 4 );
					__.strictEqual( require( "#path" ), "./lib" );
					__.strictEqual( require( "#resolvedPath" ), path.resolve( __dirname ) );
					__.strictEqual( require( "#resolvedCMDPath" ), path.resolve( process.cwd(), "./lib" ) );
					__.strictEqual( require( ":resolvedRoute" ), "lib/test" );
					__.done();
				}
			};

		}
	}
};
