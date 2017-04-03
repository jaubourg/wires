"use strict";

const prototype = module.constructor.prototype;

const requireSymbol = require( `./util/requireSymbol` );
prototype[ requireSymbol ] = prototype.require;

const config = require( `./config` );
const path = require( `path` );

const rawLength = 2;
const rExpr = /^[#?:~>]|{[#?]/;
const rRaw = /^::/;

const configSymbol = Symbol( `wires-config` );

prototype.require = function( request ) {
    if ( rRaw.test( request ) ) {
        // eslint-disable-next-line no-param-reassign
        request = request.slice( rawLength );
    } else if ( rExpr.test( request ) ) {
        const thisConfig = this[ configSymbol ] || ( this[ configSymbol ] = config( path.dirname( this.filename ) ) );
        return thisConfig.get( request, this );
    }
    return this[ requireSymbol ]( request );
};
