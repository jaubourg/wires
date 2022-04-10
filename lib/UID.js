"use strict";

const { randomBytes } = require( `crypto` );

const LENGTH = 30;

// eslint-disable-next-line no-magic-numbers
module.exports = randomBytes( LENGTH ).toString( `hex` );
