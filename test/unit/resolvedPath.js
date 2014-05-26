"use strict";

module.exports = {
	"wires.json": {
		"path": "./lib",
		"resolvedPath": "@/lib",
		"resolvedCMDPath": ">/lib"
	},
	"resolvedPath.unit.js": function() {

		var path = require( "path" );

		module.exports = {
			test: function( __ ) {
				__.expect( 3 );
				__.strictEqual( require( "#path" ), "./lib" );
				__.strictEqual( require( "#resolvedPath" ), path.resolve( __dirname, "./lib" ) );
				__.strictEqual( require( "#resolvedCMDPath" ), path.resolve( process.cwd(), "./lib" ) );
				__.done();
			}
		};

	},
	"/lib": {
		"resolvedPathSub.unit.js": function() {

			var path = require( "path" );

			module.exports = {
				test: function( __ ) {
					__.expect( 3 );
					__.strictEqual( require( "#path" ), "./lib" );
					__.strictEqual( require( "#resolvedPath" ), path.resolve( __dirname ) );
					__.strictEqual( require( "#resolvedCMDPath" ), path.resolve( process.cwd(), "./lib" ) );
					__.done();
				}
			};

		}
	}
};
