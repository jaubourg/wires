"use strict";

module.exports = {
	"wires.json": function() {
		return {
			key: "value"
		};
	},
	"malformed.unit.js": function() {

		module.exports = {
			test: function( __ ) {
				__.expect( 1 );
				__.throws( function() {
					require( "#key" );
				} );
				__.done();
			}
		};

	}
};
