"use strict";

// wires has been installed globally by the binary
// so we call the require of the module that called us
const whereAmI = require( `../../lib/util/whereAmI` );
global.wires = string => require.cache[ whereAmI( -1 ).getFileName() ].require( string );
