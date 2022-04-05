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
            async test( __ ) {
                __.plan( 2 );
                await importAndRequire( `#paths` ).deepEqual( {
                    "data": `./lib/data`,
                    "tests": [ `./lib/test1`, `./lib/test2` ],
                } );
            },
        };
    },
};
