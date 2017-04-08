#!/usr/bin/env node

/* eslint-disable no-console, no-process-exit */

"use strict";

const Module = module.constructor;

require( Module._findPath( `wires/lib/cli.js`, Module._nodeModulePaths( `.` ) ) || `./cli.js` )( {
    "argv": process.argv,
    "stdio": `inherit`,
    "log": console.log,
    "error": console.error,
    exit( code ) {
        process.exit( code );
    },
} );
