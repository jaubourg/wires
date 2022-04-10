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
                    __.plan( 2 );
                    await __.importAndRequire( `#` ).deepEqual( {
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
                    __.plan( 2 );
                    await __.importAndRequire( `#` ).throws();
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
                    __.plan( 2 );
                    await __.importAndRequire( `#` ).throws();
                },
            };
        },
    },
};
