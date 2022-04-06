"use strict";

// build parser
require( `child_process` ).execSync( `node ${ __dirname }/../scripts/preparePublish TestVersion` );
process.env.WIRES_DIR = require( `path` ).resolve( __dirname, `../publish` );

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
