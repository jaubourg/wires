/* eslint-disable no-console, no-process-exit */

"use strict";

require( `resolve` )( `wires/lib/cli`, {
    "basedir": process.cwd(),
}, ( _, filename ) => {
    require( filename || `./cli` )( {
        "argv": process.argv,
        "stdio": `inherit`,
        "log": console.log,
        "error": console.error,
        exit( code ) {
            process.exit( code );
        },
    } );
} );
