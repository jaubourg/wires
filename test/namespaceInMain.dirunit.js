"use strict";

module.exports = {
	"wires-defaults.json": {
		"NAMESPACE": "woops",
		"key": "value"
	},
	"namespace.in.main.unit.js": function() {

		module.exports = {
			test: function( __ ) {
				__.expect( 1 );
				__.throws( function() {
					require( "#key" );
				}, /NAMESPACE/, "cannot define NAMESPACE outside main wires.json" );
				__.done();
			}
		};
	}
};
