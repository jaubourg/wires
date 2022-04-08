#!/usr/bin/env node

/* eslint-disable no-console */

"use strict";

const Module = module.constructor;

const LOCALS = [ `wires/cli`, `wires/lib/cli.js` ];

let path;

for ( let i = 0; !path && ( i < LOCALS.length ); ++i ) {
    try {
        path = Module._findPath( LOCALS[ i ], Module._nodeModulePaths( `.` ) );
    } catch ( e ) {
        if ( e.code !== `ERR_PACKAGE_PATH_NOT_EXPORTED` ) {
            throw e;
        }
    }
}

require( path || `./cli` )( {
    "argv": process.argv,
    "error": console.error,
    "exit": process.exit,
    "log": console.log,
    "stdio": `inherit`,
} );
