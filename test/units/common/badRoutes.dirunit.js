"use strict";

module.exports = {
    "/nonString": {
        "wires.json": {
            ":boolean": true,
        },
        "nonStringRoute.unit.js"() {
            module.exports = {
                async "non string route"( __ ) {
                    __.plan( 2 );
                    await __.importAndRequire( `:boolean` ).throws();
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
                async "non string route"( __ ) {
                    __.plan( 2 );
                    await __.importAndRequire( `:null/something` ).throws();
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
                async "empty route"( __ ) {
                    __.plan( 2 );
                    await __.importAndRequire( `:empty` ).throws();
                },
            };
        },
    },
};
