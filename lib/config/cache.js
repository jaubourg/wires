"use strict";

var Config = require( "./Config" );
var path = require( "path" );

var cache = {};

function getFor( dir ) {
    var parentDir;
    if ( !cache.hasOwnProperty( dir ) ) {
        parentDir = path.dirname( dir );
        cache[ dir ] = new Config( dir, parentDir && ( parentDir !== dir ) && getFor( parentDir ) );
    }
    return cache[ dir ];
}

module.exports = getFor;
