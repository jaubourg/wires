"use strict";

const config = require( `./config` );
const Module = require( `module` );
const path = require( `path` );
const whereAmI = require( `./util/whereAmI` );

const resolveFilename = Module._resolveFilename;

const rawLength = 2;
const rRaw = /^::/;

const wiresResolveFilename = ( request, parent ) => (
    rRaw.test( request ) ?
        resolveFilename( request.substr( rawLength ), parent ) :
        config(
            path.dirname( parent ? parent.filename : process.cwd() )
        ).handleExpression( request, parent, resolveFilename )
);

let installed = false;

const wires = request => {
    const caller = whereAmI( -1 ).getFileName();
    const parent = caller === `module.js` ? null : require.cache[ caller ];
    const resolved = wiresResolveFilename( request, parent );
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
