"use strict";

const fields = [ `major`, `minor`, `patch` ];

module.exports = Object.fromEntries(
    process.versions.node.split( `.` ).map( ( x, i ) => [ fields[ i ], Number( x ) ] )
);
