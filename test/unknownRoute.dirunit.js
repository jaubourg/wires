"use strict";

module.exports = {
    "unknown_route.unit.js"() {
        module.exports = {
            test( __ ) {
                __.expect( 1 );
                __.throws( () => {
                    require( `:xf56z` );
                }, `unknown route 'xf56z'` );
                __.done();
            },
        };
    },
};