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
                async "dir route override"( __ ) {
                    __.plan( 2 );
                    await __.importAndRequire( `:path/test.js` ).strictEqual( `child` );
                },
            };
        },
    },
};
