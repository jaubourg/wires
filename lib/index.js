"use strict";

const assert = require( `assert` ).ok;
const Config = require( `./config/Config` );
const { dirname } = require( `path` );

const CONFIG = Symbol( `wires-config` );
const GET = Symbol( `wires-config` );
const REQUIRE = Symbol( `require` );

const rValue = /^[#?]|^\s*\(\s*(?:bool(?:ean)?|num(ber)?)\s*\)/;
const rRouteExpr = /^[~>]|{[#?]/;

const Module = module.constructor;
const { _resolveFilename, prototype } = Module;

prototype[ GET ] = function( expr, isPath = false ) {
    const config = this[ CONFIG ] || ( this[ CONFIG ] = Config.cache( dirname( this.filename ) ) );
    const { value } = config.get( expr, isPath );
    return isPath ? _resolveFilename( value, this ) : value;
};

prototype[ REQUIRE ] = prototype.require;

prototype.require = function( request ) {
    assert( request, `missing path` );
    assert( typeof request === `string`, `path must be a string` );
    return rValue.test( request ) ? this[ GET ]( request ) : this[ REQUIRE ]( request );
};

Module._resolveFilename = ( request, mod ) => {
    if ( request[ 0 ] === `:` ) {
        if ( request[ 1 ] === `:` ) {
            if ( request[ 2 ] === `:` ) {
                // eslint-disable-next-line no-magic-numbers
                return _resolveFilename( request.slice( 3 ), mod );
            }
            // eslint-disable-next-line no-magic-numbers
            return _resolveFilename( request.slice( 2 ), mod );
        }
        return mod[ GET ]( request, true );
    }
    return rRouteExpr.test( request ) ? mod[ GET ]( request, true ) : _resolveFilename( request, mod );
};

module.exports = undefined;
