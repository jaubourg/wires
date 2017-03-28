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
                __.strictEqual( wires( `#key` ), `value` );
                __.strictEqual( wires( `#keyDefaults` ), `valueDefault` );
                __.done();
            },
            route( __ ) {
                __.expect( 2 );
                __.strictEqual( wires( `:module` ), require( `./test` ) );
                __.strictEqual( wires( `:moduleDefaults` ), require( `./test` ) );
                __.done();
            },
        };
    },
};
