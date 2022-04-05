"use strict";

module.exports = {
    "wires.json": {
        "path": `./lib`,
        "cmdPath": `>/lib`,
        ":cmdPath": `>/lib/nodeVersion`,
        ":resolvedRoute": `./lib/test.js`,
        "indirectResolvedRoute": `./lib/test.js`,
        ":indirectResolvedRoute": `{#indirectResolvedRoute}`,
        ":homeRoute": `~/--wires-does-not-exist.js`,
    },
    "resolved_path.unit.js"() {
        const { resolve } = require( `path` );
        module.exports = {
            async test( __ ) {
                __.plan( 11 );
                __.strictEqual( require.resolve( `:cmdPath` ), resolve( process.cwd(), `lib/nodeVersion.js` ) );
                await Promise.allSettled( [
                    importAndRequire.all( [
                        [ `#path`, `./lib` ],
                        [ `#cmdPath`, `>/lib` ],
                        [ `:resolvedRoute`, `lib/test` ],
                        [ `:indirectResolvedRoute`, `lib/test` ],
                    ] ).strictEqual(),
                    importAndRequire( `:homeRoute` ).throws( / Cannot find module / ),
                ] );
            },
        };
    },
    "/lib": {
        "wires.json": {
            ":backResolvedRoute": `../lib/test.js`,
        },
        "test.js"() {
            module.exports = `lib/test`;
        },
        "resolved_path_sub.unit.js"() {
            const { resolve } = require( `path` );
            module.exports = {
                async test( __ ) {
                    __.plan( 13 );
                    __.strictEqual( require.resolve( `:cmdPath` ), resolve( process.cwd(), `lib/nodeVersion.js` ) );
                    await Promise.allSettled( [
                        importAndRequire.all( [
                            [ `#path`, `./lib` ],
                            [ `#cmdPath`, `>/lib` ],
                            [ `:resolvedRoute`, `lib/test` ],
                            [ `:backResolvedRoute`, `lib/test` ],
                            [ `:indirectResolvedRoute`, `lib/test` ],
                        ] ).strictEqual(),
                        importAndRequire( `:homeRoute` ).throws( / Cannot find module / ),
                    ] );
                },
            };
        },
    },
};
