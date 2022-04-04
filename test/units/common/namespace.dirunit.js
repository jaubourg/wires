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
                test( __ ) {
                    __.plan( 1 );
                    __.deepEqual( require( `#` ), {
                        "name": `John`,
                        "age": 27,
                    } );
                    __.end();
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
                "empty"( __ ) {
                    __.plan( 1 );
                    __.throws( () => require( `#` ) );
                    __.end();
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
                "wrong type"( __ ) {
                    __.plan( 1 );
                    __.throws( () => require( `#` ) );
                    __.end();
                },
            };
        },
    },
};
