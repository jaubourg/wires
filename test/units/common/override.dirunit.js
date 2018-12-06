"use strict";

module.exports = {
    "wires.json": {
        "array": [ `a`, `b`, `c` ],
        "folder": `lib`,
        "lolfolder": `lol{#folder}`,
        ":module": `./{#folder}/test.js`,
    },
    "wires.test.json": {
        "array": [ 1, 2, 3 ],
    },
    "/lib": {
        "test.js"() {
            module.exports = `in lib`;
        },
    },
    "/src": {
        "test.js"() {
            module.exports = `in src`;
        },
    },
    "/level1": {
        "override_level1.unit.js"() {
            module.exports = {
                test( __ ) {
                    __.expect( 4 );
                    __.deepEqual(
                        require( `#array` ),
                        process.env.WIRES_ENV === `test` ? [ 1, 2, 3 ] : [ `a`, `b`, `c` ]
                    );
                    __.strictEqual( require( `#folder` ), `lib` );
                    __.strictEqual( require( `#lolfolder` ), `lollib` );
                    __.strictEqual( require( `:module` ), `in lib` );
                    __.done();
                },
            };
        },
        "/then": {
            "wires.json": {
                "array": [ 4, 5, 6 ],
                "folder": `none`,
            },
            "wires.test.json": {
                "folder": `src`,
            },
            "/level2": {
                "override_level2.unit.js"() {
                    const isTest = process.env.WIRES_ENV === `test`;
                    module.exports = {
                        test( __ ) {
                            __.expect( 4 );
                            __.deepEqual( require( `#array` ), [ 4, 5, 6 ] );
                            __.strictEqual( require( `#folder` ), isTest ? `src` : `none` );
                            __.strictEqual( require( `#lolfolder` ), isTest ? `lolsrc` : `lolnone` );
                            if ( isTest ) {
                                __.strictEqual( require( `:module` ), `in src` );
                            } else {
                                __.throws( () => require( `:module` ) );
                            }
                            __.done();
                        },
                    };
                },
            },
        },
    },
};
