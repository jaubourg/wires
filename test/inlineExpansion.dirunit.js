"use strict";

module.exports = {
    "wires.json": {
        "folder": "lib",
    },
    "/lib": {
        "test.js": function() {
            module.exports = "lib";
        },
    },
    "/level": {
        "inline_expansion.unit.js": function() {
            module.exports = {
                "test": function( __ ) {
                    __.expect( 1 );
                    __.strictEqual( require( "./{#folder}/test.js" ), "level/lib" );
                    __.done();
                },
            };
        },
        "/lib": {
            "test.js": function() {
                module.exports = "level/lib";
            },
        },
    },
};
