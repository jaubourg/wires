"use strict";

module.exports = {
    "wires.json": {
        ":fs": "fs",
    },
    "route_to_main.unit.js": function() {
        module.exports = {
            "test": function( __ ) {
                __.expect( 1 );
                __.strictEqual( require( ":fs" ), require( "fs" ) );
                __.done();
            },
        };
    },
};
