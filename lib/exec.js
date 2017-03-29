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
    const override = require( `./util/commandLineOverride` )( argv );
    require( `./config/Config` ).commandLineOverride = override.data;
    process.argv = override.argv;
    process.execArgv = process.execArgv.slice( 0, minusLastTwo );
    require( `.` ).install();
    requireMain( argv[ 1 ] );
};
