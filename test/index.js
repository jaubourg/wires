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
    execUnits( `cli` ),
    // test with binary
    execUnits( `common`, true ),
    // test with local
    execUnits( `common` ),
    // report cover
    cover && cover.report,
] );
