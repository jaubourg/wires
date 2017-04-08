#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

"use strict";

let cli;

try {
    const Module = module.constructor;
    cli = require( Module._findPath( `wires/lib/cli`, Module._nodeModulePaths( `.` ) ) );
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
