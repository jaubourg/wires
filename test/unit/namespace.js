"use strict";

module.exports = {
	"wires.json": {
		"sub": {
			"name": "John"
		}
	},
	"/sub": {
		"wires.json": {
			"NAMESPACE": "sub",
			"age": 27
		},
		"namespace.unit.js": function() {

			module.exports = {
				test: function( __ ) {
					__.expect( 1 );
					__.deepEqual( require( "#" ), {
						NAMESPACE: "sub",
						name: "John",
						age: 27
					} );
					__.done();
				}
			};

		}
	}
};
