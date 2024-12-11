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
            `(json) true`,
            `(json) 16`,
            `(json) "string"`,
            `(json) woops`,
            `(num) 16`,
            `(num)16`,
            `(number) 16`,
            `(number)16`,
            `(num) anything`,
        ],
        "cast_json_object": `(json) \\{ "property": 1024 \\}`,
        "cast_json_array": `(json) [ 1, 2, 3 ]`,
        "cast_bool_fallback1": `(bool) wrong`,
        "cast_bool_fallback1?": true,
        "cast_bool_fallback2": `(bool) false`,
        "cast_bool_fallback2?": true,
        "cast_json_fallback": `(json) woops`,
        "cast_json_fallback?": `hello`,
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
                await Promise.allSettled( [
                    __.importAndRequire( `#array` ).deepEqual( [ 1, 2, 3 ] ),
                    __.importAndRequire.all( [
                        [ `#array.length`, 3 ],
                        [ `#false`, false ],
                        [ `#key`, `value` ],
                        [ `#null`, null ],
                        [ `#object.field`, `value` ],
                        [ `#object.sub.subField`, `subValue` ],
                    ] ).strictEqual(),
                ] );
            },
            async "undefined data"( __ ) {
                __.plan( 6 );
                await __.importAndRequire.all( [
                    [ `#notDefined`, undefined ],
                    [ `#null.notDefined`, undefined ],
                    [ `#object.notDefined`, undefined ],
                ] ).strictEqual();
            },
            async "data is cloned"( __ ) {
                __.plan( 8 );
                await Promise.allSettled( [ `#array`, `#object` ].map( async expression => {
                    const value = require( expression );
                    const tmp = __.importAndRequire( expression );
                    tmp.notStrictRequireEqual( value );
                    tmp.deepRequireEqual( value );
                    await tmp.sameImportAs( expression );
                    await tmp.deepImportEqual( value );
                } ) );
            },
            async "environment data"( __ ) {
                __.plan( 5 );
                await __.importAndRequire( `#>PATH` ).strictEqual( process.env.PATH );
                const tmp = __.importAndRequire( `#>` );
                tmp.strictRequireEqual( process.env );
                await tmp.notStrictImportEqual( process.env );
                await tmp.deepImportEqual( {
                    ...process.env,
                } );
            },
            async "casts"( __ ) {
                const check =
                    [ true, true, true, true, false, null, null, true, 16, `string`, null, 16, 16, 16, 16, NaN ];
                const fallbacks = [
                    [ `#cast_bool_fallback1`, true ],
                    [ `#cast_bool_fallback2`, false ],
                    [ `#cast_json_fallback`, `hello` ],
                    [ `#cast_number_fallback`, 16 ],
                ];
                const json = [
                    [
                        `#cast_json_object`, {
                            "property": 1024,
                        },
                    ],
                    [ `#cast_json_array`, [ 1, 2, 3 ] ],
                ];
                __.plan( ( ( check.length + fallbacks.length + json.length ) * 2 ) + 2 );
                const cast = require( `#cast` );
                const { "default": castM } = await import( `#cast` );
                __.strictEqual( castM.length, check.length, `import: array has correct length` );
                __.strictEqual( cast.length, check.length, `require: array has correct length` );
                const isActuallyNaN = n => ( typeof n === `number` ) && isNaN( n );
                check.forEach( ( v, i ) => {
                    if ( isActuallyNaN( v ) ) {
                        __.ok( isActuallyNaN( castM[ i ] ), `import: #${ i } is ${ v }` );
                        __.ok( isActuallyNaN( cast[ i ] ), `require: #${ i } is ${ v }` );
                    } else {
                        __.strictEqual( castM[ i ], v, `import: #${ i } is ${ v }` );
                        __.strictEqual( cast[ i ], v, `require: #${ i } is ${ v }` );
                    }
                } );
                await __.importAndRequire.all( fallbacks ).strictEqual();
                await __.importAndRequire.all( json ).deepEqual();
            },
            async route( __ ) {
                __.plan( 3 );
                const tmp = __.importAndRequire( `:module` );
                tmp.sameRequireAs( `./test` );
                await tmp.sameAs( `./test.js` );
            },
            async raw( __ ) {
                __.plan( 3 );
                __.importAndRequire( `::./raw{#hello}` ).strictRequireEqual( `raw` );
                await __.importAndRequire( `::./test.js` ).sameAs( `./test.js` );
            },
        };
    },
};
