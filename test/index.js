"use strict";

const execUnits = require( `./runner/execUnits` );
const runner = require( `./runner` );

const cover = ( process.argv[ 2 ] === `cover` ) && require( `./runner/cover` );

runner( [
    // lint
    !cover && require( `./runner/lint` ),
    // instrument
    cover && cover.instrument,
    // test with binary
    execUnits( true ),
    // test with local
    execUnits(),
    // report cover
    cover && cover.report,
] );
