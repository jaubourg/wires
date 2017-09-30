"use strict";

const execUnits = require( `./runner/execUnits` );
const runner = require( `./runner` );

runner( [
    // lint
    require( `./runner/lint` ),
    // test command line
    execUnits( `cli` ),
    // test with binary
    execUnits( `common`, true ),
    // test with local
    execUnits( `common` ),
] );
