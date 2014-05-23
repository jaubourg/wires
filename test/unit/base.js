"use strict";

module.exports = {
	"wires.json": {
		"key": "value",
		":module": "./test.js"
	},
	"test.js": function() {

		"use strict";

		module.exports = {};

	},
	"base.unit.js": function() {

		"use strict";

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
			route: function( __ ) {
				__.expect( 1 );
				__.strictEqual( require( ":module" ), require( "./test" ) );
				__.done();
			}
		};

	}
};
