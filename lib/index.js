"use strict";

const config = require( `./config` );
const Module = require( `module` );
const path = require( `path` );
const whoCalled = require( `./util/whoCalled` );

const resolveFilename = Module._resolveFilename;

const rawLength = 2;
const rExpr = /^[#?:~>]|{[#?]/;
const rRaw = /^::/;

const wiresResolveFilename = ( request, parent ) => {
    if ( rRaw.test( request ) ) {
        return resolveFilename( request.slice( rawLength ), parent );
    }
    if ( rExpr.test( request ) ) {
        return config(
            path.dirname( parent ? parent.filename : process.cwd() )
        ).handleExpression( request, parent, resolveFilename );
    }
    return resolveFilename( request, parent );
};

let installed = false;

const wires = request => {
    const resolved = wiresResolveFilename( request, whoCalled() );
    const moduleObject = require.cache[ resolved ];
    return moduleObject ? moduleObject.exports : require( resolved );
};

wires.install = () => {
    if ( !installed ) {
        installed = true;
        Module._resolveFilename = wiresResolveFilename;
    }
};

module.exports = wires;
