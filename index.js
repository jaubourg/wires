"use strict";

const assert = require( `assert` ).ok;
const Config = require( `./lib/config/Config` );
const { dirname } = require( `path` );

const CONFIG = Symbol( `wires-config` );
const GET = Symbol( `wires-config` );
const REQUIRE = Symbol( `require` );

const rBypass = /^::/;
const rRouteExpr = /^[~>:]|{[#?]/;
const rValue = /^[#?]|^\s*\(\s*(?:bool(?:ean)?|num(ber)?)\s*\)/;

const Module = module.constructor;
const { _resolveFilename, prototype } = Module;

prototype[ GET ] = function( expr, isPath = false ) {
    const config = this[ CONFIG ] || ( this[ CONFIG ] = Config.cache( dirname( this.filename ) ) );
    const value = config.get( expr, isPath ).getValue();
    return isPath ? _resolveFilename( value, this ) : value;
};

prototype[ REQUIRE ] = prototype.require;

prototype.require = function( request ) {
    assert( request, `missing path` );
    assert( typeof request === `string`, `path must be a string` );
    return rValue.test( request ) ? this[ GET ]( request ) : this[ REQUIRE ]( request );
};

Module._resolveFilename = ( request, mod ) => {
    if ( rBypass.test( request ) ) {
        // eslint-disable-next-line no-magic-numbers
        return _resolveFilename( request.slice( 2 ), mod );
    }
    if ( rRouteExpr.test( request ) ) {
        return mod[ GET ]( request, true );
    }
    return _resolveFilename( request.replace( rBypass, `` ), mod );
};

module.exports = undefined;
