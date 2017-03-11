"use strict";

module.exports = {
    "wires.json": {
        "folder": "lib",
        "paths": {
            "data": "./{#folder}/data",
            "tests": [ "./{#folder}/test1", "./{#folder}/test2" ],
        },
    },
    "recursive_expansion.unit.js": function() {
        module.exports = {
            "test": function( __ ) {
                __.expect( 1 );
                __.deepEqual( require( "#paths" ), {
                    "data": "./lib/data",
                    "tests": [ "./lib/test1", "./lib/test2" ],
                } );
                __.done();
            },
        };
    },
};
