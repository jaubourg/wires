"use strict";

function requireMain( expression ) {
    var Module = require( "module" );
    var _load = Module._load;
    Module._load = function( request ) {
        Module._load = _load;
        _load( request, null, true );
    };
    require( expression );
}

var minusLastTwo = -2;

module.exports = function( argv ) {
    process.argv = argv;
    process.execArgv = process.execArgv.slice( 0, minusLastTwo );
    require( "./index" );
    requireMain( argv[ 1 ] );
};
