"use strict";

module.exports = {
    "wires.json": {
        "folder": "lib",
        "show": "value_is_{#folder}",
        "path": "{#>PATH}",
        ":module": "./{#folder}/test.js",
    },
    "/lib": {
        "test.js": function() {
            module.exports = {};
        },
    },
    "expansion.unit.js": function() {
        module.exports = {
            "data": function( __ ) {
                __.expect( 2 );
                __.strictEqual( require( "#show" ), "value_is_lib" );
                __.strictEqual( require( "#path" ), process.env.PATH );
                __.done();
            },
            "route": function( __ ) {
                __.expect( 1 );
                __.strictEqual( require( ":module" ), require( "./lib/test" ) );
                __.done();
            },
        };
    },
};
