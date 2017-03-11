"use strict";

module.exports = {
    "wires.json": {
        "array": [ "a", "b", "c" ],
        "folder": "lib",
        "lolfolder": "lol{#folder}",
        ":module": "./{#folder}/test.js",
    },
    "wires.test.json": {
        "array": [ 1, 2, 3 ],
    },
    "/lib": {
        "test.js": function() {
            module.exports = "in lib";
        },
    },
    "/src": {
        "test.js": function() {
            module.exports = "in src";
        },
    },
    "/level1": {
        "override_level1.unit.js": function() {
            module.exports = {
                "test": function( __ ) {
                    __.expect( 4 );
                    var oldEnv = process.env.NODE_ENV;
                    process.env.NODE_ENV = "test";
                    __.deepEqual( require( "#array" ), [ 1, 2, 3 ] );
                    __.strictEqual( require( "#folder" ), "lib" );
                    __.strictEqual( require( "#lolfolder" ), "lollib" );
                    __.strictEqual( require( ":module" ), "in lib" );
                    process.env.NODE_ENV = oldEnv;
                    __.done();
                },
            };
        },
        "/then": {
            "wires.json": {
                "array": [ 4, 5, 6 ],
                "folder": "none",
            },
            "wires.test.json": {
                "folder": "src",
            },
            "/level2": {
                "override_level2.unit.js": function() {
                    module.exports = {
                        "test": function( __ ) {
                            __.expect( 4 );
                            var oldEnv = process.env.NODE_ENV;
                            process.env.NODE_ENV = "test";
                            __.deepEqual( require( "#array" ), [ 4, 5, 6 ] );
                            __.strictEqual( require( "#folder" ), "src" );
                            __.strictEqual( require( "#lolfolder" ), "lolsrc" );
                            __.strictEqual( require( ":module" ), "in src" );
                            process.env.NODE_ENV = oldEnv;
                            __.done();
                        },
                    };
                },
            },
        },
    },
};
