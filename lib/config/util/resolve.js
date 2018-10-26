"use strict";

const Module = module.constructor;
module.exports = ( from, to ) => ( to === null ? null : Module._resolveFilename( to, Object.assign( new Module(), {
    "filename": from,
    "id": ` wires `,
    "parent": module,
} ) ) );
