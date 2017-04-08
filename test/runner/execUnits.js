"use strict";

const path = require( `path` );
const spawn = require( `../util/spawn` );

const binPath = path.resolve( __dirname, `../../lib/bin.js` );
const unitPath = path.resolve( __dirname, `../util/runUnits.js` );

module.exports = ( type, bin ) => () => {
    console.log( `running tests for ${ type } (${ bin ? `` : `no ` }binary)\n` );
    const env = {};
    for ( const key of Object.keys( process.env ) ) {
        env[ key ] = process.env[ key ];
    }
    env[ `NODE_ENV` ] = `test`;
    return spawn( {
        "args": bin ? [ binPath, unitPath, type ] : [ unitPath, type ],
        env,
    } );
};
