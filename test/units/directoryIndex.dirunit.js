"use strict";

module.exports = {
    "test.js"() {
        module.exports = false;
    },
    "/test": {
        "index.js"() {
            module.exports = true;
        },
    },
    "test.unit.js"() {
        module.exports = {
            test( __ ) {
                __.expect( 1 );
                __.ok( require( `./test/` ) );
                __.done();
            },
        };
    },
};
