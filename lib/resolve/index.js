"use strict";

const Config = require( `./Config` );
const nodeResolve = require( `../util/nodeResolve` );
const path = require( `path` );

const map = new Map();

const cache = dir => {
    if ( !map.has( dir ) ) {
        const parentDir = path.dirname( dir );
        map.set( dir, new Config( dir, parentDir && ( parentDir !== dir ) && cache( parentDir ) ) );
    }
    return map.get( dir );
};

const rawLength = 2;
const rExpr = /^[#?:~>]|{[#?]/;
const rRaw = /^::/;

module.exports = ( request, parent ) => {
    if ( rRaw.test( request ) ) {
        return nodeResolve( request.slice( rawLength ), parent );
    }
    if ( rExpr.test( request ) ) {
        return cache( path.dirname( parent.filename ) ).handleExpression( request, parent );
    }
    return nodeResolve( request, parent );
};
