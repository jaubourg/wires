"use strict";

module.exports = file => {
    try {
        return require( file );
    } catch ( e ) {
        if ( e.code !== `MODULE_NOT_FOUND` ) {
            throw e;
        }
    }
    return false;
};
