"use strict";

const whoCalled = require( `./util/whoCalled` );
const wiresResolve = require( `./resolve` );

let installed = false;

const wires = request => {
    const resolved = wiresResolve( request, whoCalled() );
    const moduleObject = require.cache[ resolved ];
    return moduleObject ? moduleObject.exports : require( installed ? `::${ resolved }` : resolved );
};

wires.install = () => {
    if ( !installed ) {
        installed = true;
        require( `module` )._resolveFilename = wiresResolve;
    }
};

module.exports = wires;
