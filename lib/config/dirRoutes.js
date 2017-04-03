"use strict";

const add = ( dirRoutes, directory, route, value ) => {
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
        current.set( `/`, {
            directory,
            value,
        } );
    }
    return output;
};

const merge = ( dirRoutes, parentDirRoutes ) => {
    if ( !parentDirRoutes ) {
        return dirRoutes;
    }
    const target = dirRoutes || new Map();
    for ( const item of parentDirRoutes ) {
        const key = item[ 0 ];
        const value = item[ 1 ];
        if ( key === `/` ) {
            if ( !target.has( key ) ) {
                target.set( key, value );
            }
        } else {
            target.set( key, merge( target.get( key ), value ) );
        }
    }
    return target;
};

module.exports = {
    add,
    merge,
};
