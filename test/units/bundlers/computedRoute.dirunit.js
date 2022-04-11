"use strict";

module.exports = {
    "wires.json": {
        "sub": `sub`,
        ":dyn/()": `./route.js`,
    },
    "route.js"() {
        const sub = require( `#sub` );
        module.exports = () => `${ __dirname }/${ sub }`;
    },
    "/sub": {
        "index.js"() {
            module.exports = `found`;
        },
    },
    "test.unit.js"() {
        module.exports = {
            test( __ ) {
                __.plan( 1 );
                __.strictEqual( require( `:dyn/anything` ), `found`, `we found it!` );
            },
        };
    },
};
