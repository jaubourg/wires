"use strict";

const Module = require( `module` );

module.exports = ( filename, parent, compile ) => {
    const instance = new Module( filename, parent );
    instance.filename = filename;
    require.cache[ filename ] = instance;
    compile( instance );
    instance.loaded = true;
    return instance;
};
