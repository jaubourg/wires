"use strict";

module.exports = new Map( [
    [ `>`, process.cwd() ],
    [ `~`, require( `os` ).homedir() ],
] );
