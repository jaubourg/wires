"use strict";

const path = require( `path` );
const spawn = require( `child_process` ).spawn;

const binPath = path.resolve( __dirname, `../../lib/bin.js` );
const unitPath = path.resolve( __dirname, `units.js` );

module.exports = bin => () => new Promise( ( resolve, reject ) => {
    console.log( `running unit tests (${ bin ? `no ` : `` }binary)\n` );
    const env = {};
    for ( const key of Object.keys( process.env ) ) {
        env[ key ] = process.env[ key ];
    }
    env[ `NODE_ENV` ] = `test`;
    spawn(
        process.execPath,
        bin ? [ binPath, unitPath ] : [ unitPath ],
        {
            env,
            "stdio": `inherit`,
        }
    )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} );

