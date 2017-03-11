"use strict";

module.exports = {
    "wires.json": {
        "key": "value from json",
    },
    "wires.js": function() {
        module.exports = {
            "key": "value from js",
        };
    },
    "javascript.unit.js": function() {
        module.exports = {
            "javascript": function( __ ) {
                __.expect( 1 );
                __.strictEqual( require( "#key" ), "value from js" );
                __.done();
            },
        };
    },
};
