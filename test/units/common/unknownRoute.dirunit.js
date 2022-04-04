"use strict";

module.exports = {
    "unknown_route_no_config.unit.js"() {
        module.exports = {
            test( __ ) {
                __.plan( 1 );
                __.throws( () => {
                    require( `:xf56z` );
                }, `unknown route 'xf56z'` );
                __.end();
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
                test( __ ) {
                    __.plan( 6 );
                    __.strictEqual( require( `:null` ), null );
                    __.strictEqual( require( `:null-computed` ), null );
                    __.strictEqual( require( `:null-generic` ), null );
                    __.strictEqual( require( `:null-generic/child` ), null );
                    __.strictEqual( require( `:null-generic/very/long/path/.../...` ), null );
                    __.throws( () => {
                        require( `:xf56z` );
                    }, `unknown route 'xf56z'` );
                    __.end();
                },
            };
        },
    },
};
