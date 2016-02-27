"use strict";

module.exports = {
	"wires.json": {
		"hello_#unknown": "hello_{#unknown}",
		"hello_?unknown": "hello_{?unknown}"
	},
	"conditional.unit.js": function() {

		module.exports = {
			test: function( __ ) {
				__.expect( 4 );
				__.strictEqual( require( "#unexisting" ), undefined );
				__.strictEqual( require( "?unexisting" ), "" );
				__.strictEqual( require( "#hello_#unknown" ), "hello_undefined" );
				__.strictEqual( require( "#hello_?unknown" ), "hello_" );
				__.done();
			}
		};
	}
};
