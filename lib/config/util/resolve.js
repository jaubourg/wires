"use strict";

const Module = module.constructor;
module.exports = ( from, to ) => Module._resolveFilename( to, Object.assign( new Module(), {
    "filename": from,
    "id": ` wires `,
    "parent": module,
} ) );
