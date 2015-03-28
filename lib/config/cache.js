"use strict";

var cashe = require( "cashe" );
var Config = require( "./Config" );
var path = require( "path" );

var getFor = module.exports = cashe( function( dir ) {
	var parentDir = path.dirname( dir );
	return new Config( dir, parentDir && parentDir !== dir && getFor( parentDir ) );
} );
