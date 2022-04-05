"use strict";

module.exports = {
    "wires.json": {
        "lib": `lib/index.js`,

        ":dir/": `./lib/`,
        ":indirect": `./{#lib}`,
        ":route": `./lib/index.js`,
    },
    "/lib": {
        "index.js"() {
            // empty
        },
    },
    "test.unit.js"() {
        const index = require( `path` ).resolve( __dirname, `lib`, `index.js` );

        module.exports = {
            async test( __ ) {
                const list = [
                    `:dir/index.js`,
                    `:indirect`,
                    `:route`,
                    `::./lib/index.js`,
                ];
                __.plan( list.length * 3 );
                list.forEach( expression => __.strictEqual( require.resolve( expression ), index ) );
                await importAndRequire.all( list.map( e => [ e, index ] ) ).sameAs();
            },
        };
    },
};
