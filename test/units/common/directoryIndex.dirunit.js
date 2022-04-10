"use strict";

module.exports = {
    "wires.json": {
        ":test": `./test/`,
        ":test-esm": `./test/index.js`,
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
            async test( __ ) {
                __.plan( 4 );
                const tmp = __.importAndRequire( `:test` );
                tmp.strictRequireEqual( true );
                await tmp.throwsImport();
                await __.importAndRequire( `:test-esm` ).strictEqual( true );
            },
        };
    },
};
