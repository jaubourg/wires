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
                __.plan( 1 );
                __.throws( () => {
                    require( `#key` );
                } );
                __.end();
            },
        };
    },
};
