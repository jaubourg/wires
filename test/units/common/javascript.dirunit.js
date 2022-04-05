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
                const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                __.plan( 2 );
                await importAndRequire( `#key` ).strictEqual( `value from js` );
            },
        };
    },
};
