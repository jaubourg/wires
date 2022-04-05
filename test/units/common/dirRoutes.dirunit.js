"use strict";

module.exports = {
    "wires.json": {
        ":dir/": `./dir1/`,
        ":dir/two/": `./dir2/`,
        ":dir/three/sub/": `./dir3/`,
        ":dir/four/sub/": `./dir1/`,
        ":dyn/()": `./sub/dyn`,
    },
    "/dir1": {
        "number.json": 1,
        "numberES.js"() {
            module.exports = 1;
        },
        "index.js"() {
            module.exports = `dir1`;
        },
    },
    "/dir2": {
        "number.json": 2,
        "numberES.js"() {
            module.exports = 2;
        },
        "three-number.json": 3,
        "three-numberES.js"() {
            module.exports = 3;
        },
        "/sub": {
            "number.json": 4,
            "numberES.js"() {
                module.exports = 4;
            },
        },
        "index.js"() {
            module.exports = `dir2`;
        },
    },
    "/dir3": {
        "number.json": 5,
        "numberES.js"() {
            module.exports = 5;
        },
        "index.js"() {
            module.exports = `dir3`;
        },
    },
    "/sub": {
        "dyn.js": () => {
            module.exports = ( ...parts ) => ( parts.length ? `:${ parts.join( `/` ) }` : `../dir3/numberES.js` );
        },
        "wires.json": {
            ":dir/three/": `../dir2/three-`,
        },
        "wires-defaults.js"() {
            module.exports = {
                ":bad-dyn1/()": `../does/not/exist`,
                ":bad-dyn2/()": `../dir3/numberES.js`,
                ":dyn-conf1/()": require( `./dyn.js` ),
                ":dyn-conf2/": require( `./dyn.js` ),
            };
        },
        "dirRoute.unit.js"() {
            module.exports = {
                async test( __ ) {
                    __.plan( 98 );
                    await Promise.allSettled( [ `:`, `:dyn/`, `:dyn-conf1/`, `:dyn-conf2/` ].flatMap( pre => [
                        ...[
                            [ `${ pre }dir/number`, 1 ],
                            [ `${ pre }dir/two/number`, 2 ],
                            [ `${ pre }dir/three/number`, 3 ],
                            [ `${ pre }dir/two/sub/number`, 4 ],
                            [ `${ pre }dir/three/sub/number`, 5 ],
                            [ `${ pre }dir/four/sub/number`, 1 ],
                            [ `${ pre }dir`, `dir1` ],
                            [ `${ pre }dir/two`, `dir2` ],
                            [ `${ pre }dir/three/sub`, `dir3` ],
                            [ `${ pre }dir/four/sub`, `dir1` ],
                        ].map(
                            async ( [ expression, expected ] ) => {
                                await importAndRequire(
                                    `${ expression }${ /\/number$/.test( expression ) ? `ES.js` : `/index.js` }`
                                ).strictImportEqual( expected );
                                importAndRequire( expression ).strictRequireEqual( expected );
                            }
                        ),
                        importAndRequire( `${ pre }dir/four` ).throws(),
                        /^:dyn/.test( pre ) && importAndRequire( pre ).sameAs( `../dir3/numberES.js` ),
                    ] ).concat(
                        [ `:bad-dyn1/try`, `:bad-dyn2/try` ].map(
                            expression => importAndRequire( expression ).throws()
                        )
                    ) );
                },
            };
        },
    },
    "/subFail": {
        "wires.json": {
            ":bad-dyn/()": 56,
        },
        "dirRoute.fail-dyn.unit.js"() {
            module.exports = {
                async test( __ ) {
                    __.plan( 2 );
                    await importAndRequire( `:bad-dyn/hello` ).throws();
                },
            };
        },
    },
};
