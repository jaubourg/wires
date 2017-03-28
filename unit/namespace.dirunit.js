"use strict";

module.exports = {
    "wires.json": {
        "person": {
            "name": `John`,
        },
    },
    "/sub": {
        "wires-namespace.json": `person`,
        "wires.json": {
            "age": 27,
        },
        "namespace.unit.js"() {
            module.exports = {
                test( __ ) {
                    __.expect( 1 );
                    __.deepEqual( wires( `#` ), {
                        "name": `John`,
                        "age": 27,
                    } );
                    __.done();
                },
            };
        },
    },
};
