"use strict";

module.exports = {
    "unknown_route_no_config.unit.js"() {
        module.exports = {
            async test( __ ) {
                __.plan( 2 );
                await importAndRequire( `:xf56z` ).throws( / unknown route "xf56z"/, `unknown route "xf56z"` );
            },
        };
    },
    "/sub": {
        "wires.js"() {
            module.exports = {
                ":null": null,
                ":null-computed/": () => null,
                ":null-generic/": null,
            };
        },
        "unknown_route.unit.js"() {
            module.exports = {
                async test( __ ) {
                    __.plan( 12 );
                    await importAndRequire.all( [
                        [ `:null`, null ],
                        [ `:null-computed`, null ],
                        [ `:null-generic`, null ],
                        [ `:null-generic/child`, null ],
                        [ `:null-generic/very/long/path/.../...`, null ],
                    ] ).strictEqual();
                    await importAndRequire( `:xf56z` ).throws( / unknown route "xf56z"/, `unknown route "xf56z"` );
                },
            };
        },
    },
};
