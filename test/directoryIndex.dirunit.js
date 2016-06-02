"use strict";

module.exports = {
	"test.js": function() {

		module.exports = false;

	},
	"/test": {
		"index.js": function() {

			module.exports = true;

		}
	},
	"test.unit.js": function() {

		module.exports = {
			test: function( __ ) {
				__.expect( 1 );
				__.ok( require( "./test/" ) );
				__.done();
			}
		};

	}
};
