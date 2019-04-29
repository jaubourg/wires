"use strict";

const assert = require( `assert` ).ok;
const Config = require( `./config/Config` );
const { execute } = require( `./config/parse/util` );
const dirname = require( `path` ).dirname;

const CONFIG = Symbol( `wires-config` );
const GET = Symbol( `wires-config` );
const REQUIRE = Symbol( `require` );

const rValue = /^[#?]|^\s*\(\s*(?:bool(?:ean)?|num(ber)?)\s*\)/;
const rRouteExpr = /^[~>]|{[#?]/;

const Module = module.constructor;
const prototype = Module.prototype;

let trace;

const getTraceMap = filename => {
    let map = trace.get( filename );
    if ( !map ) {
        trace.set( filename, ( map = new Map() ) );
    }
    return map;
};

const _resolveFilename = Module._resolveFilename;

const nullModulePath = require.resolve( `./config/util/null` );

prototype[ GET ] = function( expr, isPath = false ) {
    const config = this[ CONFIG ] || ( this[ CONFIG ] = Config.cache( dirname( this.filename ) ) );
    let result;
    try {
        result = config.get( expr, isPath, Boolean( trace ) );
    } catch ( e ) {
        if ( trace ) {
            result = config.get( expr, isPath, false );
        } else {
            throw e;
        }
    }
    result = execute( result );
    if ( isPath ) {
        result.value = _resolveFilename( result.value, this );
    }
    if ( trace ) {
        getTraceMap( this.filename ).set(
            expr,
            // traces null module as null value
            isPath && ( result.value === nullModulePath ) ? {
                "code": `null`,
                "type": `value`,
                "value": null,
            } : result
        );
    }
    return result.value;
};

prototype[ REQUIRE ] = prototype.require;

prototype.require = function( request ) {
    assert( request, `missing path` );
    assert( typeof request === `string`, `path must be a string` );
    if ( rValue.test( request ) ) {
        return this[ GET ]( request );
    }
    return this[ REQUIRE ]( request );
};

const resolveFilename = ( expr, mod ) => {
    const value = _resolveFilename( expr, mod );
    if ( trace ) {
        getTraceMap( mod.filename ).set( expr, {
            "type": `path`,
            value,
        } );
        getTraceMap( value );
    }
    return value;
};

Module._resolveFilename = ( request, mod ) => {
    if ( request[ 0 ] === `:` ) {
        if ( request[ 1 ] === `:` ) {
            if ( request[ 2 ] === `:` ) {
                // eslint-disable-next-line no-magic-numbers
                return _resolveFilename( request.slice( 3 ), mod );
            }
            // eslint-disable-next-line no-magic-numbers
            return resolveFilename( request.slice( 2 ), mod );
        }
        return mod[ GET ]( request, true );
    }
    if ( rRouteExpr.test( request ) ) {
        return mod[ GET ]( request, true );
    }
    return resolveFilename( request, mod );
};

module.exports = {
    "startTrace": () => {
        if ( !trace ) {
            trace = new Map();
        }
        return trace;
    },
    "stopTrace": () => {
        const tmp = trace;
        trace = undefined;
        return tmp;
    },
};
