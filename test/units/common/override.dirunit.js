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
                async test( __ ) {
                    __.plan( 8 );
                    await Promise.allSettled( [
                        __.importAndRequire( `#array` ).deepEqual(
                            process.env.WIRES_ENV === `test` ? [ 1, 2, 3 ] : [ `a`, `b`, `c` ]
                        ),
                        __.importAndRequire.all( [
                            [ `#folder`, `lib` ],
                            [ `#lolfolder`, `lollib` ],
                            [ `:module`, `in lib` ],
                        ] ).strictEqual(),
                    ] );
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
                        async test( __ ) {
                            __.plan( 8 );
                            await Promise.allSettled( [
                                __.importAndRequire( `#array` ).deepEqual( [ 4, 5, 6 ] ),
                                __.importAndRequire.all( [
                                    [ `#folder`, isTest ? `src` : `none` ],
                                    [ `#lolfolder`, isTest ? `lolsrc` : `lolnone` ],
                                ] ).strictEqual(),
                                (
                                    isTest ?
                                        __.importAndRequire( `:module` ).strictEqual( `in src` ) :
                                        __.importAndRequire( `:module` ).throws( / Cannot find module / )
                                ),
                            ] );
                        },
                    };
                },
            },
        },
    },
};
