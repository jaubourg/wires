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
                test( __ ) {
                    __.plan( 1 );
                    __.strictEqual( require( `./{#folder}/test.js` ), `level/lib` );
                    __.end();
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
