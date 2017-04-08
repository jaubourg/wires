"use strict";

module.exports = {
    "wires.json": {
        ":path/": `./path-`,
    },
    "path-test.js"() {
        module.exports = `parent`;
    },
    "/child": {
        "wires-defaults.json": {
            ":path/": `./defaults-`,
        },
        "wires.json": {
            ":path/": `./child-`,
        },
        "defaults-test.js"() {
            module.exports = `defaults`;
        },
        "child-test.js"() {
            module.exports = `child`;
        },
        "dirRouteOverride.unit.js"() {
            module.exports = {
                "dir route override"( __ ) {
                    __.expect( 1 );
                    __.strictEqual( require( `:path/test` ), `child` );
                    __.done();
                },
            };
        },
    },
};
