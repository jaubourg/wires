"use strict";

const { randomBytes } = require( `crypto` );

const LENGTH = 20;

// eslint-disable-next-line no-magic-numbers
module.exports = `wires_${ randomBytes( LENGTH ).toString( `hex` ) }`;
