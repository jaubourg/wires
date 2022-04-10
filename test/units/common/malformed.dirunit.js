"use strict";

module.exports = {
    "wires.json"() {
        return {
            "key": `value`,
        };
    },
    "malformed.unit.js"() {
        module.exports = {
            async test( __ ) {
                __.plan( 2 );
                await __.importAndRequire( `#key` ).throws();
            },
        };
    },
};
