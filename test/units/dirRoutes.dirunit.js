"use strict";

module.exports = {
    "wires.json": {
        ":dir/": `./dir1/`,
        ":dir/two/": `./dir2/`,
        ":dir/three/sub/": `./dir3/`,
    },
    "/dir1": {
        "number.json": 1,
        "index.js"() {
            module.exports = `dir1`;
        },
    },
    "/dir2": {
        "number.json": 2,
        "three-number.json": 3,
        "/sub": {
            "number.json": 4,
        },
        "index.js"() {
            module.exports = `dir2`;
        },
    },
    "/dir3": {
        "number.json": 5,
        "index.js"() {
            module.exports = `dir3`;
        },
    },
    "/sub": {
        "wires.json": {
            ":dir/three/": `../dir2/three-`,
        },
        "dirRoute.unit.js"() {
            module.exports = {
                test( __ ) {
                    __.expect( 8 );
                    __.strictEqual( require( `:dir/number` ), 1 );
                    __.strictEqual( require( `:dir/two/number` ), 2 );
                    __.strictEqual( require( `:dir/three/number` ), 3 );
                    __.strictEqual( require( `:dir/two/sub/number` ), 4 );
                    __.strictEqual( require( `:dir/three/sub/number` ), 5 );
                    __.strictEqual( require( `:dir` ), `dir1` );
                    __.strictEqual( require( `:dir/two` ), `dir2` );
                    __.strictEqual( require( `:dir/three/sub` ), `dir3` );
                    __.done();
                },
            };
        },
    },
};
