"use strict";

module.exports = {
    "wires.json"() {
        return {
            "key": `value`,
        };
    },
    "malformed.unit.js"() {
        module.exports = {
            test( __ ) {
                __.expect( 1 );
                __.throws( () => {
                    wires( `#key` );
                } );
                __.done();
            },
        };
    },
};
