"use strict";

module.exports = {
    "wires.json": {
        "folder": `lib`,
        "paths": {
            "data": `./{#folder}/data`,
            "tests": [ `./{#folder}/test1`, `./{#folder}/test2` ],
        },
    },
    "recursive_expansion.unit.js"() {
        module.exports = {
            test( __ ) {
                __.expect( 1 );
                __.deepEqual( wires( `#paths` ), {
                    "data": `./lib/data`,
                    "tests": [ `./lib/test1`, `./lib/test2` ],
                } );
                __.done();
            },
        };
    },
};
