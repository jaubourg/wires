#!/usr/bin/env node

/* eslint-disable no-console */

"use strict";

const Module = module.constructor;

let path;

try {
    path = Module._findPath( `wires/lib/cli.js`, Module._nodeModulePaths( `.` ) );
} catch ( e ) {}

require( path || `./lib/cli` )( {
    "argv": process.argv,
    "error": console.error,
    "exit": process.exit,
    "log": console.log,
    "stdio": `inherit`,
} );
