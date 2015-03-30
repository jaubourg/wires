"use strict";

module.exports = {
	"wires.json": {
		"person": {
			"name": "John"
		}
	},
	"/sub": {
		"wires.json": {
			"NAMESPACE": "person",
			"age": 27
		},
		"namespace.unit.js": function() {

			module.exports = {
				test: function( __ ) {
					__.expect( 1 );
					__.deepEqual( require( "#" ), {
						name: "John",
						age: 27
					} );
					__.done();
				}
			};

		}
	}
};
