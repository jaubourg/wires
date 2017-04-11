"use strict";

module.exports = {
    "wires.json": {
        "key": `value`,
        "false": false,
        ":module": `./test.js`,
    },
    "test.js"() {
        module.exports = {};
    },
    "raw{#hello}.js"() {
        module.exports = `raw`;
    },
    "base.unit.js"() {
        module.exports = {
            data( __ ) {
                __.expect( 2 );
                __.strictEqual( require( `#key` ), `value` );
                __.strictEqual( require( `#false` ), false );
                __.done();
            },
            "undefined data"( __ ) {
                __.expect( 1 );
                __.strictEqual( require( `#notDefined` ), undefined );
                __.done();
            },
            "environment data"( __ ) {
                __.expect( 2 );
                __.strictEqual( require( `#>PATH` ), process.env.PATH );
                __.strictEqual( require( `#>` ), process.env );
                __.done();
            },
            route( __ ) {
                __.expect( 1 );
                __.strictEqual( require( `:module` ), require( `./test` ) );
                __.done();
            },
            raw( __ ) {
                __.expect( 1 );
                __.strictEqual( require( `::./raw{#hello}` ), `raw` );
                __.done();
            },
        };
    },
};
