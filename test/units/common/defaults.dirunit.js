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
                const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                __.plan( 4 );
                await importAndRequire.all( [
                    [ `#key`, `value` ],
                    [ `#keyDefaults`, `valueDefault` ],
                ] ).strictEqual();
            },
            async route( __ ) {
                const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                __.plan( 4 );
                await importAndRequire.all( [
                    [ `:module`, `./test.js` ],
                    [ `:moduleDefaults`, `./test.js` ],
                ] ).sameAs();
            },
        };
    },
};
