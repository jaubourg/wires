"use strict";

const assert = require( `assert` ).ok;
const Config = require( `./config/Config` );
const dirname = require( `path` ).dirname;

const configSymbol = Symbol( `wires-config` );
const getConfigSymbol = Symbol( `wires-config` );
const requireSymbol = Symbol( `require` );

const rValue = /^[#?]/;
const rRouteExpr = /^[~>]|{[#?]/;

const Module = module.constructor;
const prototype = Module.prototype;

prototype[ getConfigSymbol ] = function() {
    return this[ configSymbol ] || ( this[ configSymbol ] = Config.cache( dirname( this.filename ) ) );
};

prototype[ requireSymbol ] = prototype.require;

prototype.require = function( request ) {
    assert( request, `missing path` );
    assert( typeof request === `string`, `path must be a string` );
    if ( rValue.test( request ) ) {
        return this[ getConfigSymbol ]().getValue( request );
    }
    return this[ requireSymbol ]( request );
};

const resolveFilename = Module._resolveFilename;

Module._resolveFilename = ( request, mod ) => {
    if ( request[ 0 ] === `:` ) {
        return resolveFilename(
            request[ 1 ] === `:` ?
                // eslint-disable-next-line no-magic-numbers
                request.slice( 2 ) :
                mod[ getConfigSymbol ]().getRoute( request ),
            mod
        );
    }
    if ( rRouteExpr.test( request ) ) {
        return resolveFilename( mod[ getConfigSymbol ]().parseRoute( request ), mod );
    }
    return resolveFilename( request, mod );
};
