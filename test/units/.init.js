"use strict";

try {
    require( `#` );
} catch ( e ) {
    require( `../..` );
    console.log( `wires included\n` );
    require( `#` );
}
