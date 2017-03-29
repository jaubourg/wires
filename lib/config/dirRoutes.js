"use strict";

module.exports = {
    "add": ( dirRoutes, route, value ) => {
        const output = dirRoutes || new Map();
        let current = output;
        for ( const part of route.slice( 0, -1 ).split( `/` ) ) {
            if ( current.has( part ) ) {
                current = current.get( part );
            } else {
                const tmp = new Map();
                current.set( part, tmp );
                current = tmp;
            }
        }
        if ( !current.has( `/` ) ) {
            current.set( `/`, value );
        }
        return output;
    },
};
