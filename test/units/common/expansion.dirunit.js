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
            data( __ ) {
                __.plan( 2 );
                __.strictEqual( require( `#show` ), `value_is_lib` );
                __.strictEqual( require( `#path` ), process.env.PATH );
                __.end();
            },
            route( __ ) {
                __.plan( 1 );
                __.strictEqual( require( `:module` ), require( `./lib/test` ) );
                __.end();
            },
        };
    },
};
