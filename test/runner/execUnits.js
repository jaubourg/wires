"use strict";

const path = require( `path` );
const { spawn } = require( `child_process` );

const binPath = path.resolve( __dirname, `../../bin.js` );
const unitPath = path.resolve( __dirname, `../util/runUnits.js` );

const wiresArgs = [
    `--require=${ path.resolve( __dirname, `../../index.js` ) }`,
    `--loader=${ path.resolve( __dirname, `../../loader.mjs` ) }`,
];

module.exports = ( type, { bin, wiresEnv = `test` } = {} ) => () => new Promise( ( resolve, reject ) => {
    console.log(
        `running tests for ${ type } (${
            bin ? `` : `no `
        }binary, ENV=${
            wiresEnv || `-`
        })\n`
    );
    const env = {};
    for ( const key of Object.keys( process.env ) ) {
        env[ key ] = process.env[ key ];
    }
    env[ `WIRES_ENV` ] = wiresEnv;
    spawn(
        process.execPath,
        bin ? [ binPath, unitPath, type ] : [ ...wiresArgs, unitPath, type ],
        {
            env,
            "stdio": `inherit`,
        }
    )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} );
