"use strict";

module.exports = {
    "wires.json": {
        "person": {
            "name": `John`,
        },
    },
    "/sub": {
        "wires.json": {
            "@namespace": `person `,
            "age": 27,
        },
        "namespace.unit.js"() {
            module.exports = {
                async test( __ ) {
                    const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                    __.plan( 2 );
                    await importAndRequire( `#` ).deepEqual( {
                        "name": `John`,
                        "age": 27,
                    } );
                },
            };
        },
    },
    "/subEmpty": {
        "wires.json": {
            "@namespace": `  `,
            "age": 27,
        },
        "namespace.unit.js"() {
            module.exports = {
                async "empty"( __ ) {
                    const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                    __.plan( 2 );
                    await importAndRequire( `#` ).throws();
                },
            };
        },
    },
    "/subWrong": {
        "wires.json": {
            "@namespace": true,
            "age": 27,
        },
        "namespace.unit.js"() {
            module.exports = {
                async "wrong type"( __ ) {
                    const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                    __.plan( 2 );
                    await importAndRequire( `#` ).throws();
                },
            };
        },
    },
};
