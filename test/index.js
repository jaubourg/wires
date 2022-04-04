"use strict";

// build parser
require( `../scripts/build` );

const execUnits = require( `./runner/execUnits` );
const runner = require( `./runner` );

runner( [
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
