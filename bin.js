#!/usr/bin/env node

/* eslint-disable no-console */

"use strict";

const Module = module.constructor;

require( Module._findPath( `wires/lib/cli.js`, Module._nodeModulePaths( `.` ) ) || `./lib/cli.js` )( {
    "argv": process.argv,
    "error": console.error,
    "exit": process.exit,
    "log": console.log,
    "stdio": `inherit`,
} );
