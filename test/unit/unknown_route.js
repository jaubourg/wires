"use strict";

module.exports = {
	"unknown_route.unit.js": function() {

		module.exports = {
			test: function( __ ) {
				__.expect( 1 );
				__.throws( function() {
					require( ":xf56z" );
				}, "unknown route 'xf56z'" );
				__.done();
			}
		};
	}
};
