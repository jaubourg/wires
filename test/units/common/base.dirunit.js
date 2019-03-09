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
        "cast": [
            `(bool)  true`,
            `(bool)true`,
            `(boolean)  true`,
            `(boolean)true`,
            `(bool) false`,
            `(bool) woops`,
            `(bool) TRUE`,
            `(num) 16`,
            `(num)16`,
            `(number) 16`,
            `(number)16`,
            `(num) anything`,
        ],
        "cast_bool_fallback1": `(bool) wrong`,
        "cast_bool_fallback1?": true,
        "cast_bool_fallback2": `(bool) false`,
        "cast_bool_fallback2?": true,
        "cast_number_fallback": `(num) not an number`,
        "cast_number_fallback?": 16,
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
            "casts"( __ ) {
                __.expect( 15 );
                const cast = require( `#cast` );
                let i = 0;
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( cast[ i++ ], false );
                __.strictEqual( cast[ i++ ], null );
                __.strictEqual( cast[ i++ ], null );
                __.strictEqual( cast[ i++ ], 16 );
                __.strictEqual( cast[ i++ ], 16 );
                __.strictEqual( cast[ i++ ], 16 );
                __.strictEqual( cast[ i++ ], 16 );
                __.ok( isNaN( cast[ i++ ] ) );
                __.strictEqual( require( `#cast_bool_fallback1` ), true );
                __.strictEqual( require( `#cast_bool_fallback2` ), false );
                __.strictEqual( require( `#cast_number_fallback` ), 16 );
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
