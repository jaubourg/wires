"use strict";

const exec = require( `./exec` );
const execUnits = require( `./execUnits` );
const runner = require( `./runner` );

const cover = ( process.argv[ 2 ] === `cover` ) && require( `./cover` );

runner( [
    // lint
    !cover && exec( `@eslint --color -f codeframe .` ),
    // instrument
    cover && cover.instrument,
    // test with binary
    execUnits( true ),
    // test with local
    execUnits(),
    // report cover
    cover && cover.report,
] );
