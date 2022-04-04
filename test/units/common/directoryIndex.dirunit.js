"use strict";

module.exports = {
    "wires.json": {
        ":test": `./test/`,
    },
    "test.js"() {
        module.exports = false;
    },
    "/test": {
        "index.js"() {
            module.exports = true;
        },
    },
    "test.unit.js"() {
        module.exports = {
            test( __ ) {
                __.plan( 1 );
                __.strictEqual( require( `:test` ), true );
                __.end();
            },
        };
    },
};
