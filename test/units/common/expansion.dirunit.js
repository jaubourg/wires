"use strict";

module.exports = {
    "wires.json": {
        "folder": `lib`,
        "show": `value_is_{#folder}`,
        "path": `{#>PATH}`,
        ":module": `./{#folder}/test.js`,
    },
    "/lib": {
        "test.js"() {
            module.exports = {};
        },
    },
    "expansion.unit.js"() {
        module.exports = {
            async data( __ ) {
                __.plan( 4 );
                await importAndRequire.all( [
                    [ `#show`, `value_is_lib` ],
                    [ `#path`, process.env.PATH ],
                ] ).strictEqual();
            },
            async route( __ ) {
                __.plan( 2 );
                await importAndRequire( `:module` ).sameAs( `./lib/test.js` );
            },
        };
    },
};
