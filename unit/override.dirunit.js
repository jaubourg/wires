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
                    __.deepEqual( wires( `#array` ), [ 1, 2, 3 ] );
                    __.strictEqual( wires( `#folder` ), `lib` );
                    __.strictEqual( wires( `#lolfolder` ), `lollib` );
                    __.strictEqual( wires( `:module` ), `in lib` );
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
                    module.exports = {
                        test( __ ) {
                            __.expect( 4 );
                            __.deepEqual( wires( `#array` ), [ 4, 5, 6 ] );
                            __.strictEqual( wires( `#folder` ), `src` );
                            __.strictEqual( wires( `#lolfolder` ), `lolsrc` );
                            __.strictEqual( wires( `:module` ), `in src` );
                            __.done();
                        },
                    };
                },
            },
        },
    },
};
