"use strict";

module.exports = new Map( [
    [ `>`, process.cwd() ],
    // eslint-disable-next-line newline-per-chained-call
    [ `~`, require( `os` ).homedir().replace( /\\/g, `/` ) ],
] );
