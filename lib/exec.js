"use strict";

const commandLineOverride = require( `./config/commandLineOverride` );

module.exports = argv => {
    process.argv = commandLineOverride( argv );
    // eslint-disable-next-line no-magic-numbers
    process.execArgv = process.execArgv.slice( 0, -2 );
    require( `.` );
    module.constructor._load( argv[ 1 ], null, true );
};
