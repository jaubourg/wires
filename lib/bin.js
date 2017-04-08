#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

"use strict";

let cli;

try {
    cli = ( new ( module.constructor )() ).require( `wires/lib/cli` );
} catch ( e ) {
    cli = require( `./cli` );
}

cli( {
    "argv": process.argv,
    "stdio": `inherit`,
    "log": console.log,
    "error": console.error,
    exit( code ) {
        process.exit( code );
    },
} );
