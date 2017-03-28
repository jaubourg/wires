"use strict";

// wires has been installed globally by the binary
// so we call the require of the module that called us
const whoCalled = require( `../../lib/util/whoCalled` );
global.wires = string => require.cache[ whoCalled() ].require( string );
