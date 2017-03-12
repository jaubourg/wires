"use strict";

const configCache = require( `./config/cache` );
const Module = require( `module` );
const path = require( `path` );

const resolveFilename = Module._resolveFilename;

const rawLength = 2;
const rRaw = /^::/;

Module._resolveFilename = ( request, parent ) => (
    rRaw.test( request ) ?
        resolveFilename( request.substr( rawLength ), parent ) :
        configCache(
            path.dirname( parent ? parent.filename : process.cwd() )
        ).handleExpression( request, parent, resolveFilename )
);
