"use strict";

module.exports = {
    "wires.json": {
        "person": {
            "name": `John`,
        },
    },
    "/sub": {
        "wires.json": {
            "@root": true,
            "age": 27,
        },
        "root.unit.js"() {
            module.exports = {
                async test( __ ) {
                    __.plan( 2 );
                    await importAndRequire( `#` ).deepEqual( {
                        "age": 27,
                    } );
                },
            };
        },
    },
    "/subWrong": {
        "wires.json": {
            "@root": `true`,
            "age": 27,
        },
        "root.unit.js"() {
            module.exports = {
                async "wrong type"( __ ) {
                    __.plan( 2 );
                    await importAndRequire( `#` ).throws( / root should be a boolean, string provided/ );
                },
            };
        },
    },
    "/withNamespace": {
        "wires.json": {
            "@namespace": ` person `,
            "@root": true,
            "age": 27,
        },
        "wires-defaults.json": {
            "@namespace": ` bob `,
            "@root": false,
            "age": 14,
        },
        "root.unit.js"() {
            module.exports = {
                async "with namespace"( __ ) {
                    __.plan( 2 );
                    await importAndRequire( `#` ).deepEqual( {
                        "age": 27,
                    } );
                },
            };
        },
    },
};
