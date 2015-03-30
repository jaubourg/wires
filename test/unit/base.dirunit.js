"use strict";

module.exports = {
	"wires.json": {
		"key": "value",
		":module": "./test.js"
	},
	"test.js": function() {

		module.exports = {};

	},
	"base.unit.js": function() {

		module.exports = {
			data: function( __ ) {
				__.expect( 1 );
				__.strictEqual( require( "#key" ), "value" );
				__.done();
			},
			"undefined data": function( __ ) {
				__.expect( 1 );
				__.strictEqual( require( "#notDefined" ), undefined );
				__.done();
			},
			"environment data": function( __ ) {
				__.expect( 1 );
				__.strictEqual( require( "#>PATH" ), process.env.PATH );
				__.done();
			},
			route: function( __ ) {
				__.expect( 1 );
				__.strictEqual( require( ":module" ), require( "./test" ) );
				__.done();
			}
		};

	}
};
