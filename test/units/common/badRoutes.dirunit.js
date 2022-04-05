"use strict";

module.exports = {
    "/nonString": {
        "wires.json": {
            ":boolean": true,
        },
        "nonStringRoute.unit.js"() {
            module.exports = {
                async "non string route"( __ ) {
                    const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                    __.plan( 2 );
                    await importAndRequire( `:boolean` ).throws();
                    __.end();
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
                    const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                    __.plan( 2 );
                    await importAndRequire( `:null/something` ).throws();
                    __.end();
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
                    const importAndRequire = __.importAndRequireFactory( e => import( e ), require );
                    __.plan( 2 );
                    await importAndRequire( `:empty` ).throws();
                    __.end();
                },
            };
        },
    },
};
