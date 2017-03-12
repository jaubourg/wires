"use strict";

function requireMain( expression ) {
    const Module = require( `module` );
    const _load = Module._load;
    Module._load = function( request ) {
        Module._load = _load;
        _load( request, null, true );
    };
    require( expression );
}

const minusLastTwo = -2;

module.exports = function( argv ) {
    process.argv = argv;
    process.execArgv = process.execArgv.slice( 0, minusLastTwo );
    require( `..` );
    requireMain( argv[ 1 ] );
};
