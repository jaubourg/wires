"use strict";

const merge = ( dirRoutes, parentDirRoutes ) => {
    if ( !parentDirRoutes ) {
        return dirRoutes;
    }
    const target = dirRoutes || new Map();
    for ( const item of parentDirRoutes ) {
        const [ key, value ] = item;
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

class DirRoutes {
    add( route, value, directory ) {
        let current = this._map || ( this._map = new Map() );
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
    }
    addAll( parent ) {
        this._map = merge( this._map, parent._map );
    }
    get( expr ) {
        let current = this._map;
        if ( !current ) {
            return undefined;
        }
        const segments = expr.split( `/` );
        let found;
        for ( const [ index, segment ] of segments.entries() ) {
            current = current.get( segment );
            if ( !current ) {
                break;
            }
            const tmp = current.get( `/` );
            if ( tmp ) {
                found = {
                    "directory": tmp.directory,
                    "index": index + 1,
                    "value": tmp.value,
                };
            }
        }
        return found && {
            "directory": found.directory,
            "remaining": segments.slice( found.index ),
            "value": found.value,
        };
    }
}

module.exports = DirRoutes;
