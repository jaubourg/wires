"use strict";

module.exports = {
    "wires.json": {
        "array": [ 1, 2, 3 ],
        "false": false,
        "key": `value`,
        ":module": `./test.js`,
        "null": null,
        "object": {
            "field": `value`,
            "sub": {
                "subField": `subValue`,
            },
        },
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
                __.expect( 7 );
                __.deepEqual( require( `#array` ), [ 1, 2, 3 ] );
                __.strictEqual( require( `#array.length` ), 3 );
                __.strictEqual( require( `#false` ), false );
                __.strictEqual( require( `#key` ), `value` );
                __.strictEqual( require( `#null` ), null );
                __.strictEqual( require( `#object.field` ), `value` );
                __.strictEqual( require( `#object.sub.subField` ), `subValue` );
                __.done();
            },
            "undefined data"( __ ) {
                __.expect( 3 );
                __.strictEqual( require( `#notDefined` ), undefined );
                __.strictEqual( require( `#null.notDefined` ), undefined );
                __.strictEqual( require( `#object.notDefined` ), undefined );
                __.done();
            },
            "data is cloned"( __ ) {
                __.expect( 4 );
                for ( const expression of [ `#array`, `#object` ] ) {
                    const first = require( expression );
                    const second = require( expression );
                    __.notStrictEqual( first, second );
                    __.deepEqual( first, second );
                }
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
