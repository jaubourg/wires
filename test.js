require( "./" );

var cache = require( "./lib/config/cache.js" );
var cacheThroughWires = require( ":hello" );
var cacheExpandInline = require( "./lib/{#configDir}/cache" );

console.log( cacheExpandInline );

console.log( cache === cacheThroughWires );
console.log( cache === cacheExpandInline );

console.log( require( "#configDir" ) );
