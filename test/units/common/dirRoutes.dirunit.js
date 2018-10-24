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
        "index.js"() {
            module.exports = `dir1`;
        },
    },
    "/dir2": {
        "number.json": 2,
        "three-number.json": 3,
        "/sub": {
            "number.json": 4,
        },
        "index.js"() {
            module.exports = `dir2`;
        },
    },
    "/dir3": {
        "number.json": 5,
        "index.js"() {
            module.exports = `dir3`;
        },
    },
    "/sub": {
        "dyn.js": () => {
            module.exports = ( ...parts ) => ( parts.length ? `:${ parts.join( `/` ) }` : `../dir3/number` );
        },
        "wires.json": {
            ":dir/three/": `../dir2/three-`,
        },
        "wires-defaults.js"() {
            module.exports = {
                ":bad-dyn1/()": `../does/not/exist`,
                ":bad-dyn2/()": `../dir3/number`,
                ":dyn-conf1/()": require( `./dyn.js` ),
                ":dyn-conf2/": require( `./dyn.js` ),
            };
        },
        "dirRoute.unit.js"() {
            module.exports = {
                test( __ ) {
                    __.expect( 46 );
                    for ( const pre of [ `:`, `:dyn/`, `:dyn-conf1/`, `:dyn-conf2/` ] ) {
                        __.strictEqual( require( `${ pre }dir/number` ), 1 );
                        __.strictEqual( require( `${ pre }dir/two/number` ), 2 );
                        __.strictEqual( require( `${ pre }dir/three/number` ), 3 );
                        __.strictEqual( require( `${ pre }dir/two/sub/number` ), 4 );
                        __.strictEqual( require( `${ pre }dir/three/sub/number` ), 5 );
                        __.strictEqual( require( `${ pre }dir/four/sub/number` ), 1 );
                        __.throws( () => require( `${ pre }dir/four` ) );
                        __.strictEqual( require( `${ pre }dir` ), `dir1` );
                        __.strictEqual( require( `${ pre }dir/two` ), `dir2` );
                        __.strictEqual( require( `${ pre }dir/three/sub` ), `dir3` );
                        __.strictEqual( require( `${ pre }dir/four/sub` ), `dir1` );
                    }
                    __.throws( () => require( `:bad-dyn1/try` ) );
                    __.throws( () => require( `:bad-dyn2/try` ) );
                    __.done();
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
                test( __ ) {
                    __.expect( 1 );
                    __.throws( require( `../dir3/number` ) );
                    __.done();
                },
            };
        },
    },
};
