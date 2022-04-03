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
    // test with binary
    execUnits( `common`, {
        "bin": true,
    } ),
    // test with binary and trace
    execUnits( `common`, {
        "bin": true,
        "trace": true,
    } ),
    // test with binary, no env
    execUnits( `common`, {
        "bin": true,
        "wiresEnv": ``,
    } ),
    // test with binary and trace, no env
    execUnits( `common`, {
        "bin": true,
        "wiresEnv": ``,
    } ),
    // test with local
    execUnits( `common` ),
    // test with local and trace
    execUnits( `common`, {
        "trace": true,
    } ),
] );
