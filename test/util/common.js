"use strict";

const importOrRequire = async ( filename, esm ) => {
    if ( !esm ) {
        return require( filename );
    }
    const object = {
        ...( await import( filename ) ),
    };
    return ( typeof esm === `function` ) ? esm( object ) : object;
};

module.exports = {
    importOrRequire,
};
