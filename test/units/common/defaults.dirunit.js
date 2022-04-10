"use strict";

module.exports = {
    "wires.json": {
        "key": `value`,
        ":module": `./test.js`,
    },
    "wires-defaults.json": {
        "key": `valueDefault`,
        "keyDefaults": `valueDefault`,
        ":module": `./non-existent.js`,
        ":moduleDefaults": `./test.js`,
    },
    "test.js"() {
        module.exports = {};
    },
    "defaults.unit.js"() {
        module.exports = {
            async data( __ ) {
                __.plan( 4 );
                await __.importAndRequire.all( [
                    [ `#key`, `value` ],
                    [ `#keyDefaults`, `valueDefault` ],
                ] ).strictEqual();
            },
            async route( __ ) {
                __.plan( 4 );
                await __.importAndRequire.all( [
                    [ `:module`, `./test.js` ],
                    [ `:moduleDefaults`, `./test.js` ],
                ] ).sameAs();
            },
        };
    },
};
