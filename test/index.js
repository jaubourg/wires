"use strict";

const exec = require( `./exec` );
const execUnits = require( `./execUnits` );
const runner = require( `./runner` );

runner( [
    // lint
    exec( `@eslint --color -f codeframe .` ),
    // test with binary
    execUnits( true ),
    // test with local
    execUnits(),
] );
