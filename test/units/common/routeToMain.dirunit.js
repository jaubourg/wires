"use strict";

module.exports = {
    "wires.json": {
        ":fs": `fs`,
    },
    "route_to_main.unit.js"() {
        module.exports = {
            test( __ ) {
                __.plan( 1 );
                __.strictEqual( require( `:fs` ), require( `fs` ) );
                __.end();
            },
        };
    },
};
