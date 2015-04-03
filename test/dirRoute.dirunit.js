"use strict";

module.exports = {
	"wires.json": {
		":dir/": "./dir1/",
		":dir/two/": "./dir2/",
		":dir/three/": "./dir2/three-",
		":dir/three/sub/": "./dir3/"
	},
	"/dir1": {
		"number.json": 1
	},
	"/dir2": {
		"number.json": 2,
		"three-number.json": 3,
		"/sub": {
			"number.json": 4
		}
	},
	"/dir3": {
		"number.json": 5
	},
	"dirRoute.unit.js": function() {

		module.exports = {
			test: function( __ ) {
				__.expect( 5 );
				__.strictEqual( require( ":dir/number" ), 1 );
				__.strictEqual( require( ":dir/two/number" ), 2 );
				__.strictEqual( require( ":dir/three/number" ), 3 );
				__.strictEqual( require( ":dir/two/sub/number" ), 4 );
				__.strictEqual( require( ":dir/three/sub/number" ), 5 );
				__.done();
			}
		};

	}
};
