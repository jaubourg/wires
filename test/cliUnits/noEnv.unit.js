"use strict";

const cliTest = require( `../util/cliTest` );
const path = require( `path` );

module.exports = {
    "env config was not used": cliTest( [
        process.execPath,
        path.resolve( __dirname, `../../lib/wires` ),
        path.resolve( __dirname, `../data/commandLineNoEnv/script.js` ),
    ], ( __, stdout ) => {
        __.expect( 1 );
        __.strictEqual( JSON.parse( stdout ), true );
        __.done();
    }, null, `` ),
};
