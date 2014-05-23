"use strict";

module.exports = {
	"wires.json": {
		"folder": "lib",
		"lolfolder": "lol{#folder}",
		":module": "./{#folder}/test.js"
	},
	"/lib": {
		"test.js": function() {

			module.exports = "in lib";

		}
	},
	"/src": {
		"test.js": function() {

			module.exports = "in src";

		}
	},
	"/level1": {
		"override_level1.unit.js": function() {

			module.exports = {
				test: function( __ ) {
					__.expect( 3 );
					__.strictEqual( require( "#folder" ), "lib" );
					__.strictEqual( require( "#lolfolder" ), "lollib" );
					__.strictEqual( require( ":module" ), "in lib" );
					__.done();
				}
			};
		},
		"/then": {
			"wires.json": {
				"folder": "src"
			},
			"/level2": {
				"override_level2.unit.js": function() {
					module.exports = {
						test: function( __ ) {
							__.expect( 3 );
							__.strictEqual( require( "#folder" ), "src" );
							__.strictEqual( require( "#lolfolder" ), "lolsrc" );
							__.strictEqual( require( ":module" ), "in src" );
							__.done();
						}
					};
				}
			}
		}
	}
};
