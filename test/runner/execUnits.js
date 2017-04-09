"use strict";

const path = require( `path` );
const spawn = require( `../util/spawn` );

const binPath = path.resolve( __dirname, `../../lib/bin.js` );
const unitPath = path.resolve( __dirname, `../util/runUnits.js` );

module.exports = ( type, bin ) => () => spawn( {
    "args": bin ? [ binPath, unitPath, type ] : [ unitPath, type ],
    "env": {
        "NODE_ENV": `test`,
    },
    "log": `running tests for ${ type } (${ bin ? `` : `no ` }binary)\n`,
} );
