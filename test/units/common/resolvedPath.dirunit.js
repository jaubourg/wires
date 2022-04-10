"use strict";

module.exports = {
    "wires.json": {
        "path": `./lib`,
        "cmdPath": `>/lib`,
        ":cmdPath": `>/lib/nodeVersion.js`,
        ":resolvedRoute": `./lib/test.js`,
        "indirectResolvedRoute": `./lib/test.js`,
        ":indirectResolvedRoute": `{#indirectResolvedRoute}`,
        ":homeRoute": `~/--wires-does-not-exist.js`,
    },
    "resolved_path.unit.js"() {
        const { resolve } = require( `path` );
        module.exports = {
            async test( __ ) {
                __.plan( 12 );
                await Promise.allSettled( [
                    __.importAndRequire( `:cmdPath` ).sameAs( resolve( process.cwd(), `lib/nodeVersion.js` ) ),
                    __.importAndRequire.all( [
                        [ `#path`, `./lib` ],
                        [ `#cmdPath`, `>/lib` ],
                        [ `:resolvedRoute`, `lib/test` ],
                        [ `:indirectResolvedRoute`, `lib/test` ],
                    ] ).strictEqual(),
                    __.importAndRequire( `:homeRoute` ).throws( / Cannot find module / ),
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
                    __.plan( 14 );
                    await Promise.allSettled( [
                        __.importAndRequire( `:cmdPath` ).sameAs( resolve( process.cwd(), `lib/nodeVersion.js` ) ),
                        __.importAndRequire.all( [
                            [ `#path`, `./lib` ],
                            [ `#cmdPath`, `>/lib` ],
                            [ `:resolvedRoute`, `lib/test` ],
                            [ `:backResolvedRoute`, `lib/test` ],
                            [ `:indirectResolvedRoute`, `lib/test` ],
                        ] ).strictEqual(),
                        __.importAndRequire( `:homeRoute` ).throws( / Cannot find module / ),
                    ] );
                },
            };
        },
    },
};
