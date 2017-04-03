"use strict";

const exec = require( `./exec` );

const binPath = `${ __dirname }/../lib/bin.js`;
const unitPath = `${ __dirname }/units.js`;

module.exports = ( bin, command ) => exec(
    `${ command || `node` } ${ bin ? binPath : `` } ${ unitPath } --reporter=minimal`,
    `test`
);

