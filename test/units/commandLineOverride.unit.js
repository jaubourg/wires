"use strict";

const commandLineOverride = require( `../../lib/util/commandLineOverride` );

module.exports = {
    test( __ ) {
        __.expect( 2 );
        const tmp = commandLineOverride( [
            `--arg`,
            `(flag)`,
            `hello`,
            `(!unflag,)`,
            `(bool=true,string='true',otherString='hello')`,
            `tmp`,
            `tmp2`,
            `()`,
            `--help`,
            `(object.flag2,!object.unflag2,object.string=world,object.int=3)`,
            `end`,
        ] );
        __.deepEqual( tmp.argv, [
            `--arg`,
            `hello`,
            `tmp`,
            `tmp2`,
            `--help`,
            `end`,
        ], `argv properly cleaned up` );
        __.deepEqual( tmp.data, {
            "flag": true,
            "unflag": false,
            "bool": true,
            "string": `true`,
            "otherString": `hello`,
            "object": {
                "flag2": true,
                "unflag2": false,
                "string": `world`,
                "int": 3,
            },
        }, `data properly constructed` );
        __.done();
    },
};
