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
                const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                __.plan( 2 );
                await importAndRequire( `#key` ).throws();
            },
        };
    },
};
