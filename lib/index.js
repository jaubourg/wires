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

const wires = request => require( wiresResolveFilename( request, require.cache[ whereAmI( -1 ).getFilename() ] ) );

let installed = false;

wires.install = () => {
    if ( !installed ) {
        installed = true;
        Module._resolveFilename = wiresResolveFilename;
    }
};

module.exports = wires;
