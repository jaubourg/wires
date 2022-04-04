"use strict";

module.exports = {
    "wires.json": {
        "lib": `lib`,

        ":dir/": `./lib/`,
        ":indirect": `./{#lib}`,
        ":route": `./lib`,
    },
    "/lib": {
        "index.js"() {
            // empty
        },
    },
    "test.unit.js"() {
        const index = require( `path` ).resolve( __dirname, `lib`, `index.js` );

        module.exports = {
            test( __ ) {
                __.plan( 4 );
                __.strictEqual( require.resolve( `:dir/index` ), index );
                __.strictEqual( require.resolve( `:indirect` ), index );
                __.strictEqual( require.resolve( `:route` ), index );
                __.strictEqual( require.resolve( `::./lib` ), index );
                __.end();
            },
        };
    },
};
