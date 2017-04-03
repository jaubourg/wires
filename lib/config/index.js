"use strict";

const Config = require( `./Config` );
const path = require( `path` );

const map = new Map();

const cache = dir => {
    if ( !map.has( dir ) ) {
        const parentDir = path.dirname( dir );
        map.set( dir, new Config( dir, parentDir && ( parentDir !== dir ) && cache( parentDir ) ) );
    }
    return map.get( dir );
};

module.exports = cache;
