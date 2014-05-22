require( "./" );

var cache = require( "./lib/config/cache.js" );
var cacheThroughWires = require( ":hello" );

console.log( cache === cacheThroughWires );

try {
	var configDir = require( "#configDir" );
} catch( e ) {
	console.log( require( "module" )._cache );
	throw e;
}
console.log( configDir );
