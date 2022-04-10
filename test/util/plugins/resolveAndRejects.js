"use strict";

const RESOLVE_OR_REJECT = Symbol( `resolve or reject` );

const tapeExtension = {
    async [ RESOLVE_OR_REJECT ]( block, tapeMethod, args ) {
        let result;
        let error;
        try {
            result = await block();
        } catch ( e ) {
            error = e;
        }
        return this[ tapeMethod ]( () => {
            if ( error ) {
                throw error;
            }
            return result;
        }, ...args );
    },
    rejects( block, ...args ) {
        return this[ RESOLVE_OR_REJECT ]( block, `throws`, args );
    },
    resolves( block, ...args ) {
        return this[ RESOLVE_OR_REJECT ]( block, `doesNotThrow`, args );
    },
};

module.exports = {
    "object": tapeObject => {
        if ( !tapeObject[ RESOLVE_OR_REJECT ] ) {
            Object.assign( Object.getPrototypeOf( tapeObject ), tapeExtension );
        }
        return tapeObject;
    },
};
