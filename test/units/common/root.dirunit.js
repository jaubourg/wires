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
                test( __ ) {
                    __.plan( 1 );
                    __.deepEqual( require( `#` ), {
                        "age": 27,
                    } );
                    __.end();
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
                "wrong type"( __ ) {
                    __.plan( 1 );
                    __.throws( () => require( `#` ) );
                    __.end();
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
                "with namespace"( __ ) {
                    __.plan( 1 );
                    __.deepEqual( require( `#` ), {
                        "age": 27,
                    } );
                    __.end();
                },
            };
        },
    },
};
