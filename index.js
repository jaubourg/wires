"use strict";

// silence experimental loader warning
{
    const listeners = process.listeners( `warning` );
    if ( listeners.length ) {
        process.removeAllListeners( `warning` );
        for ( const listener of listeners ) {
            process.on( `wires-warning`, listener );
        }
        const rLoader = /(?:\b|^)--experimental-loader(?:\b|$)/;
        process.on( `warning`, info => {
            if ( ( info.name !== `ExperimentalWarning` ) || !rLoader.test( info.message ) ) {
                process.emit( `wires-warning`, info );
            }
        } );
    }
}

const assert = require( `assert` ).ok;
const { deBypass, getConfig, isBypass, isRoute, isValue } = require( `./lib/loader-utils` );
const { dirname } = require( `path` );

const CONFIG = Symbol( `wires-config` );
const GET = Symbol( `wires-config` );
const REQUIRE = Symbol( `require` );

const Module = module.constructor;
const { _resolveFilename, prototype } = Module;

prototype[ GET ] = function( expr, isPath = false ) {
    const config = this[ CONFIG ] || ( this[ CONFIG ] = getConfig( dirname( this.filename ) ) );
    const value = config.get( expr, isPath ).getValue();
    return isPath ? _resolveFilename( value, this ) : value;
};

prototype[ REQUIRE ] = prototype.require;

prototype.require = function( request ) {
    assert( request, `missing path` );
    assert( typeof request === `string`, `path must be a string` );
    return isValue( request ) ? this[ GET ]( request ) : this[ REQUIRE ]( request );
};

Module._resolveFilename = ( request, mod ) => (
    // eslint-disable-next-line no-nested-ternary
    isBypass( request ) ?
        _resolveFilename( deBypass( request ), mod ) :
        ( isRoute( request ) ? mod[ GET ]( request, true ) : _resolveFilename( request, mod ) )
);

module.exports = undefined;
