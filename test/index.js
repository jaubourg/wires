"use strict";

const { execSync } = require( `child_process` );
const { resolve } = require( `path` );

// handles publishing
if ( process.env.WIRES_DIR ) {
    // already published ( coverage )
    process.env.WIRES_DIR = resolve( __dirname, `..`, process.env.WIRES_DIR );
} else {
    // needs publishing
    execSync( `node ${ __dirname }/../scripts/preparePublish 0.0.0` );
    process.env.WIRES_DIR = resolve( __dirname, `../publish` );
}

const execUnits = require( `./runner/execUnits` );

require( `./runner` )( [
    // lint
    require( `./runner/lint` ),
    // test command line
    execUnits( `cli` ),
    // test serialize javascript
    execUnits( `serialize-javascript` ),
    // test with binary
    execUnits( `common`, {
        "bin": true,
    } ),
    // test with binary, no env
    execUnits( `common`, {
        "bin": true,
        "wiresEnv": ``,
    } ),
    // test with --require and --loader command lines
    execUnits( `common` ),
] );
