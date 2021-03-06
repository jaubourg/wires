"use strict";

module.exports = {
    "wires.json": {
        "key": `value`,
        ":module": `./test.js`,
    },
    "wires-defaults.json": {
        "key": `valueDefault`,
        "keyDefaults": `valueDefault`,
        ":module": `./non-existent.js`,
        ":moduleDefaults": `./test.js`,
    },
    "test.js"() {
        module.exports = {};
    },
    "defaults.unit.js"() {
        module.exports = {
            data( __ ) {
                __.expect( 2 );
                __.strictEqual( require( `#key` ), `value` );
                __.strictEqual( require( `#keyDefaults` ), `valueDefault` );
                __.done();
            },
            route( __ ) {
                __.expect( 2 );
                __.strictEqual( require( `:module` ), require( `./test` ) );
                __.strictEqual( require( `:moduleDefaults` ), require( `./test` ) );
                __.done();
            },
        };
    },
};
