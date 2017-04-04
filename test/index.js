"use strict";

const execUnits = require( `./execUnits` );
const runner = require( `./runner` );

const cover = ( process.argv[ 2 ] === `cover` ) && require( `./cover` );

runner( [
    // lint
    !cover && require( `./lint` ),
    // instrument
    cover && cover.instrument,
    // test with binary
    execUnits( true ),
    // test with local
    execUnits(),
    // report cover
    cover && cover.report,
] );
