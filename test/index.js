"use strict";

const { execSync } = require( `child_process` );
const { removeSync } = require( `fs-extra` );
const { resolve } = require( `path` );

process.on( `exit`, () => {
    try {
        removeSync( resolve( __dirname, `./fixture` ) );
    } catch ( e ) {}
} );

// handles publishing
if ( process.env.WIRES_DIR ) {
    // already published ( coverage )
    process.env.WIRES_DIR = resolve( __dirname, `..`, process.env.WIRES_DIR );
} else {
    // needs publishing
    execSync( `node ${ __dirname }/../scripts/preparePublish 0.0.0` );
    process.env.WIRES_DIR = resolve( __dirname, `../publish` );
}

const execUnits = require( `./runner/execUnits` );

// eslint-disable-next-line no-console
console.log( `Running on NodeJS ${ process.version }` );

require( `./runner` )( [
    // lint
    require( `./runner/lint` ),
    // test command line
    execUnits( `cli`, {
        "bin": false,
        "bundle": false,
    } ),
    // test serialize javascript
    execUnits( `serialize-javascript`, {
        "bin": false,
        "bundle": false,
    } ),
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
    // tests without having wires installed (for bundlers)
    execUnits( `bundlers`, {
        "bin": false,
        "bundle": `only`,
    } ),
    // tests without having wires installed (for bundlers, no env)
    execUnits( `bundlers`, {
        "bin": false,
        "bundle": `only`,
        "wiresEnv": ``,
    } ),
] );
