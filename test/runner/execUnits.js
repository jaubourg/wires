"use strict";

const path = require( `path` );
const spawn = require( `child_process` ).spawn;

const binPath = path.resolve( __dirname, `../../lib/bin.js` );
const unitPath = path.resolve( __dirname, `../util/runUnits.js` );

module.exports = ( type, bin, nodeEnv = `test` ) => () => new Promise( ( resolve, reject ) => {
    console.log( `running tests for ${ type } (${ bin ? `` : `no ` }binary, ENV=${ nodeEnv || `-` })\n` );
    const env = {};
    for ( const key of Object.keys( process.env ) ) {
        env[ key ] = process.env[ key ];
    }
    env[ `WIRES_ENV` ] = nodeEnv;
    spawn( process.execPath, bin ? [ binPath, unitPath, type ] : [ unitPath, type ], {
        env,
        "stdio": `inherit`,
    } )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} );
