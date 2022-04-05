"use strict";

module.exports = {
    "wires.json": {
        "folder": `lib`,
    },
    "/lib": {
        "test.js"() {
            module.exports = `lib`;
        },
    },
    "/level": {
        "inline_expansion.unit.js"() {
            module.exports = {
                async test( __ ) {
                    __.plan( 2 );
                    await importAndRequire( `./{#folder}/test.js` ).strictEqual( `level/lib` );
                },
            };
        },
        "/lib": {
            "test.js"() {
                module.exports = `level/lib`;
            },
        },
    },
};
