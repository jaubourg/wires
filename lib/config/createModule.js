"use strict";

const Module = require( `module` );

module.exports = ( filename, compile ) => {
    const instance = new Module( filename );
    instance.filename = filename;
    require.cache[ filename ] = instance;
    compile( instance );
    instance.loaded = true;
    return instance;
};
