"use strict";

const execUnits = require( `./runner/execUnits` );
const runner = require( `./runner` );

const cover = ( process.argv[ 2 ] === `cover` ) && require( `./runner/cover` );

runner( [
    // lint
    !cover && require( `./runner/lint` ),
    // instrument
    cover && cover.instrument,
    // test command line
    execUnits( `commandLineUnits` ),
    // test with binary
    execUnits( `units`, true ),
    // test with local
    execUnits( `units` ),
    // report cover
    cover && cover.report,
] );
