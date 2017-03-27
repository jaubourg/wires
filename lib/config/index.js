"use strict";

const Config = require( `./Config` );
const path = require( `path` );

const cache = new Map();

const get = dir => {
    if ( !cache.has( dir ) ) {
        const parentDir = path.dirname( dir );
        cache.set( dir, new Config( dir, parentDir && ( parentDir !== dir ) && get( parentDir ) ) );
    }
    return cache.get( dir );
};

module.exports = get;
