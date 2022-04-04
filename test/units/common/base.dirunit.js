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
            async data( __ ) {
                __.plan( 14 );
                __.deepEqual( require( `#array` ), [ 1, 2, 3 ] );
                __.deepEqual( ( await import( `#array` ) ).default, [ 1, 2, 3 ] );
                __.strictEqual( require( `#array.length` ), 3 );
                __.strictEqual( ( await import( `#array.length` ) ).default, 3 );
                __.strictEqual( require( `#false` ), false );
                __.strictEqual( ( await import( `#false` ) ).default, false );
                __.strictEqual( require( `#key` ), `value` );
                __.strictEqual( ( await import( `#key` ) ).default, `value` );
                __.strictEqual( require( `#null` ), null );
                __.strictEqual( ( await import( `#null` ) ).default, null );
                __.strictEqual( require( `#object.field` ), `value` );
                __.strictEqual( ( await import( `#object.field` ) ).default, `value` );
                __.strictEqual( require( `#object.sub.subField` ), `subValue` );
                __.strictEqual( ( await import( `#object.sub.subField` ) ).default, `subValue` );
            },
            async "undefined data"( __ ) {
                __.plan( 6 );
                __.strictEqual( require( `#notDefined` ), undefined );
                __.strictEqual( ( await import( `#notDefined` ) ).default, undefined );
                __.strictEqual( require( `#null.notDefined` ), undefined );
                __.strictEqual( ( await import( `#null.notDefined` ) ).default, undefined );
                __.strictEqual( require( `#object.notDefined` ), undefined );
                __.strictEqual( ( await import( `#object.notDefined` ) ).default, undefined );
            },
            async "data is cloned"( __ ) {
                __.plan( 8 );
                for ( const expression of [ `#array`, `#object` ] ) {
                    const first = require( expression );
                    const second = require( expression );
                    __.notStrictEqual( first, second );
                    __.deepEqual( first, second );
                }
                await Promise.all( [ `#array`, `#object` ].map( async expression => {
                    const first = ( await import( expression ) ).default;
                    const second = ( await import( expression ) ).default;
                    __.strictEqual( first, second );
                    __.deepEqual( first, second );
                } ) );
            },
            async "environment data"( __ ) {
                __.plan( 5 );
                __.strictEqual( require( `#>PATH` ), process.env.PATH );
                __.strictEqual( ( await import( `#>PATH` ) ).default, process.env.PATH );
                __.strictEqual( require( `#>` ), process.env );
                __.notStrictEqual( ( await import( `#>` ) ).default, process.env );
                __.deepEqual( ( ( await import( `#>` ) ).default ), {
                    ...process.env,
                } );
            },
            // eslint-disable-next-line max-statements
            async "casts"( __ ) {
                __.plan( 30 );
                const cast = require( `#cast` );
                const { "default": castM } = await import( `#cast` );
                let i = 0;
                __.strictEqual( castM[ i ], true );
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( castM[ i ], true );
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( castM[ i ], true );
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( castM[ i ], true );
                __.strictEqual( cast[ i++ ], true );
                __.strictEqual( castM[ i ], false );
                __.strictEqual( cast[ i++ ], false );
                __.strictEqual( castM[ i ], null );
                __.strictEqual( cast[ i++ ], null );
                __.strictEqual( castM[ i ], null );
                __.strictEqual( cast[ i++ ], null );
                __.strictEqual( castM[ i ], 16 );
                __.strictEqual( cast[ i++ ], 16 );
                __.strictEqual( castM[ i ], 16 );
                __.strictEqual( cast[ i++ ], 16 );
                __.strictEqual( castM[ i ], 16 );
                __.strictEqual( cast[ i++ ], 16 );
                __.strictEqual( castM[ i ], 16 );
                __.strictEqual( cast[ i++ ], 16 );
                __.ok( isNaN( castM[ i ] ) );
                __.ok( isNaN( cast[ i ] ) );
                __.strictEqual( require( `#cast_bool_fallback1` ), true );
                __.strictEqual( ( await import( `#cast_bool_fallback1` ) ).default, true );
                __.strictEqual( require( `#cast_bool_fallback2` ), false );
                __.strictEqual( ( await import( `#cast_bool_fallback2` ) ).default, false );
                __.strictEqual( require( `#cast_number_fallback` ), 16 );
                __.strictEqual( ( await import( `#cast_number_fallback` ) ).default, 16 );
            },
            async route( __ ) {
                __.plan( 2 );
                __.strictEqual( require( `:module` ), require( `./test` ) );
                __.strictEqual( await import( `:module` ), await import( `./test.js` ) );
            },
            async raw( __ ) {
                __.plan( 2 );
                __.strictEqual( require( `::./raw{#hello}` ), `raw` );
                __.strictEqual( await import( `::./test.js` ), await import( `./test.js` ) );
            },
        };
    },
};
