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
            javascript( __ ) {
                __.plan( 1 );
                __.strictEqual( require( `#key` ), `value from js` );
                __.end();
            },
        };
    },
};
