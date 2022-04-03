"use strict";

const path = require( `path` );
const { spawn } = require( `child_process` );

const binPath = path.resolve( __dirname, `../../bin.js` );
const unitPath = path.resolve( __dirname, `../util/runUnits.js` );

module.exports = ( type, { bin, trace, wiresEnv = `test` } = {} ) => () => new Promise( ( resolve, reject ) => {
    console.log(
        `running tests for ${ type } (${
            bin ? `` : `no `
        }binary, ${
            trace ? `` : `no `
        }trace, ENV=${ wiresEnv || `-` })\n`
    );
    const env = {};
    for ( const key of Object.keys( process.env ) ) {
        env[ key ] = process.env[ key ];
    }
    env[ `WIRES_ENV` ] = wiresEnv;
    const boolTrace = Boolean( trace );
    spawn( process.execPath, bin ? [ binPath, unitPath, type, boolTrace ] : [ unitPath, type, boolTrace ], {
        env,
        "stdio": `inherit`,
    } )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} );
