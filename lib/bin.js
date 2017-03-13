"use strict";

require( `resolve` )( `wires/lib/cli`, {
    "basedir": process.cwd(),
}, ( _, filename ) => {
    /* eslint-disable no-console */
    require( filename || `./cli` )( {
        "argv": process.argv,
        "stdio": `inherit`,
        "log": console.log,
        "error": console.error,
        exit( code ) {
            // eslint-disable-next-line no-process-exit
            process.exit( code );
        },
    } );
} );
