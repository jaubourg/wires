"use strict";

const cliTest = require( `../../util/cliTest` );
const path = require( `path` );

module.exports = {
    "env config was not used": cliTest( [
        process.execPath,
        path.resolve( process.env.WIRES_DIR ),
        path.resolve( __dirname, `../fixture/commandLineNoEnv/script.js` ),
    ], ( __, stdout ) => {
        __.plan( 1 );
        __.strictEqual( JSON.parse( stdout ), true );
    }, null, `` ),
};
