"use strict";

module.exports = {
    "wires.json": {
        "key": `value`,
        ":module": `./test.js`,
    },
    "test.js"() {
        module.exports = {};
    },
    "base.unit.js"() {
        module.exports = {
            data( __ ) {
                __.expect( 1 );
                __.strictEqual( require( `#key` ), `value` );
                __.done();
            },
            "undefined data"( __ ) {
                __.expect( 1 );
                __.strictEqual( require( `#notDefined` ), undefined );
                __.done();
            },
            "environment data"( __ ) {
                __.expect( 1 );
                __.strictEqual( require( `#>PATH` ), process.env.PATH );
                __.done();
            },
            route( __ ) {
                __.expect( 1 );
                __.strictEqual( require( `:module` ), require( `./test` ) );
                __.done();
            },
        };
    },
};
