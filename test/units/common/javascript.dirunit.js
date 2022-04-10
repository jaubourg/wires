"use strict";

module.exports = {
    "wires.json": {
        "key": `value from json`,
    },
    "wires.js"() {
        module.exports = {
            "key": `value from js`,
        };
    },
    "javascript.unit.js"() {
        module.exports = {
            async javascript( __ ) {
                __.plan( 2 );
                await __.importAndRequire( `#key` ).strictEqual( `value from js` );
            },
        };
    },
};
