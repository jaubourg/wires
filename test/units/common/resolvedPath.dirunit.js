"use strict";

module.exports = {
    "wires.json": {
        "path": `./lib`,
        "cmdPath": `>/lib`,
        ":cmdPath": `>/lib/nodeVersion`,
        ":resolvedRoute": `./lib/test`,
        "indirectResolvedRoute": `./lib/test`,
        ":indirectResolvedRoute": `{#indirectResolvedRoute}`,
        ":homeRoute": `~/--wires-does-not-exist.js`,
    },
    "resolved_path.unit.js"() {
        const { resolve } = require( `path` );
        module.exports = {
            test( __ ) {
                __.plan( 6 );
                __.strictEqual( require( `#path` ), `./lib` );
                __.strictEqual( require( `#cmdPath` ), `>/lib` );
                __.strictEqual( require.resolve( `:cmdPath` ), resolve( process.cwd(), `lib/nodeVersion.js` ) );
                __.strictEqual( require( `:resolvedRoute` ), `lib/test` );
                __.strictEqual( require( `:indirectResolvedRoute` ), `lib/test` );
                try {
                    require( `:homeRoute` );
                    __.ok( false, `no file in home` );
                } catch ( e ) {
                    __.strictEqual( e.code, `MODULE_NOT_FOUND`, `no file in home` );
                }
                __.end();
            },
        };
    },
    "/lib": {
        "wires.json": {
            ":backResolvedRoute": `../lib/test`,
        },
        "test.js"() {
            module.exports = `lib/test`;
        },
        "resolved_path_sub.unit.js"() {
            const { resolve } = require( `path` );
            module.exports = {
                test( __ ) {
                    __.plan( 6 );
                    __.strictEqual( require( `#path` ), `./lib` );
                    __.strictEqual( require( `#cmdPath` ), `>/lib` );
                    __.strictEqual( require.resolve( `:cmdPath` ), resolve( process.cwd(), `lib/nodeVersion.js` ) );
                    __.strictEqual( require( `:resolvedRoute` ), `lib/test` );
                    __.strictEqual( require( `:backResolvedRoute` ), `lib/test` );
                    __.strictEqual( require( `:indirectResolvedRoute` ), `lib/test` );
                    __.end();
                },
            };
        },
    },
};
