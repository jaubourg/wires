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
                await Promise.allSettled( [
                    importAndRequire( `#array` ).deepEqual( [ 1, 2, 3 ] ),
                    importAndRequire.all( [
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
                await importAndRequire.all( [
                    [ `#notDefined`, undefined ],
                    [ `#null.notDefined`, undefined ],
                    [ `#object.notDefined`, undefined ],
                ] ).strictEqual();
            },
            async "data is cloned"( __ ) {
                __.plan( 8 );
                await Promise.allSettled( [ `#array`, `#object` ].map( async expression => {
                    const value = require( expression );
                    const tmp = importAndRequire( expression );
                    tmp.notStrictRequireEqual( value );
                    tmp.deepRequireEqual( value );
                    await tmp.sameImportAs( expression );
                    await tmp.deepImportEqual( value );
                } ) );
            },
            async "environment data"( __ ) {
                __.plan( 5 );
                await importAndRequire( `#>PATH` ).strictEqual( process.env.PATH );
                const tmp = importAndRequire( `#>` );
                tmp.strictRequireEqual( process.env );
                await tmp.notStrictImportEqual( process.env );
                await tmp.deepImportEqual( {
                    ...process.env,
                } );
            },
            async "casts"( __ ) {
                __.plan( 30 );
                const cast = require( `#cast` );
                const { "default": castM } = await import( `#cast` );
                [ true, true, true, true, false, null, null, 16, 16, 16, 16 ].forEach( ( v, i ) => {
                    __.strictEqual( castM[ i ], v, `import: #${ i } is ${ v }` );
                    __.strictEqual( cast[ i ], v, `require: #${ i } is ${ v }` );
                } );
                __.ok( isNaN( castM.pop() ), `import: #${ castM.length } is NaN` );
                __.ok( isNaN( cast.pop() ), `require: #${ cast.length } is NaN` );
                await importAndRequire.all( [
                    [ `#cast_bool_fallback1`, true ],
                    [ `#cast_bool_fallback2`, false ],
                    [ `#cast_number_fallback`, 16 ],
                ] ).strictEqual();
            },
            async route( __ ) {
                __.plan( 3 );
                const tmp = importAndRequire( `:module` );
                tmp.sameRequireAs( `./test` );
                await tmp.sameAs( `./test.js` );
            },
            async raw( __ ) {
                __.plan( 3 );
                importAndRequire( `::./raw{#hello}` ).strictRequireEqual( `raw` );
                await importAndRequire( `::./test.js` ).sameAs( `./test.js` );
            },
        };
    },
};
