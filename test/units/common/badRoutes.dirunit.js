"use strict";

module.exports = {
    "/nonString": {
        "wires.json": {
            ":boolean": true,
        },
        "nonStringRoute.unit.js"() {
            module.exports = {
                "non string route"( __ ) {
                    __.expect( 1 );
                    __.throws( () => require( `:boolean` ) );
                    __.done();
                },
            };
        },
    },
    "/null_computed": {
        "wires.json": {
            ":null/()": null,
        },
        "nonStringRoute.unit.js"() {
            module.exports = {
                "non string route"( __ ) {
                    __.expect( 1 );
                    __.throws( () => require( `:null/something` ) );
                    __.done();
                },
            };
        },
    },
    "/empty": {
        "wires.json": {
            ":empty": ``,
        },
        "emptyRoute.unit.js"() {
            module.exports = {
                "empty route"( __ ) {
                    __.expect( 1 );
                    __.throws( () => require( `:empty` ) );
                    __.done();
                },
            };
        },
    },
};
