"use strict";

module.exports = {
    "wires.json": {
        ":fs": `fs`,
    },
    "route_to_main.unit.js"() {
        module.exports = {
            async test( __ ) {
                __.plan( 2 );
                await importAndRequire( `:fs` ).sameAs( `fs` );
            },
        };
    },
};
