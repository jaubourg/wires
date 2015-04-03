"use strict";

module.exports = {
	"wires.json": {
		"path": "./lib",
		"cmdPath": ">/lib",
		":resolvedRoute": "./lib/test",
		"indirectResolvedRoute": "./lib/test",
		":indirectResolvedRoute": "{#indirectResolvedRoute}"
	},
	"resolved_path.unit.js": function() {

		module.exports = {
			test: function( __ ) {
				__.expect( 4 );
				__.strictEqual( require( "#path" ), "./lib" );
				__.strictEqual( require( "#cmdPath" ), ">/lib" );
				__.strictEqual( require( ":resolvedRoute" ), "lib/test" );
				__.strictEqual( require( ":indirectResolvedRoute" ), "lib/test" );
				__.done();
			}
		};

	},
	"/lib": {
		"wires.json": {
			":backResolvedRoute": "../lib/test"
		},
		"test.js": function() {

			module.exports = "lib/test";

		},
		"resolved_path_sub.unit.js": function() {

			module.exports = {
				test: function( __ ) {
					__.expect( 5 );
					__.strictEqual( require( "#path" ), "./lib" );
					__.strictEqual( require( "#cmdPath" ), ">/lib" );
					__.strictEqual( require( ":resolvedRoute" ), "lib/test" );
					__.strictEqual( require( ":backResolvedRoute" ), "lib/test" );
					__.strictEqual( require( ":indirectResolvedRoute" ), "lib/test" );
					__.done();
				}
			};

		}
	}
};
