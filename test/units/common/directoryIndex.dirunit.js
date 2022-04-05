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
                const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                __.plan( 4 );
                const tmp = importAndRequire( `:test` );
                tmp.strictRequireEqual( true );
                await tmp.throwsImport();
                await importAndRequire( `:test-esm` ).strictEqual( true );
                __.end();
            },
        };
    },
};
