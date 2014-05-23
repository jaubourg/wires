"use strict";

require( ".." );

var _ = require( "lodash" );
var fs = require( "fs" );
var nodeunit = require( "nodeunit" );
var path = require( "path" );

var r_cleanFunction = /^.*\n|\n.*$/g;
var r_unit = /[\.\\\/]unit\.js$/;

function generateTree( dir, tree ) {
	var endAction = [];
	var units = [];
	( function internal( dir, tree ) {
		fs.mkdirSync( dir );
		endAction.push( function() {
			fs.rmdirSync( dir );
		} );
		_.forOwn( tree, function( val, filename ) {
			if ( filename[ 0 ] === "/" ) {
				internal( path.join( dir, filename.substr( 1 ) ), val );
			} else {
				filename = path.join( dir, filename );
				fs.writeFileSync(
					filename,
					typeof val === "function"
						? ( val + "" ).replace( r_cleanFunction, "" )
						: JSON.stringify( val, null, "  " ),
					"utf8"
				);
				endAction.push( function() {
					fs.unlinkSync( filename );
				} );
				if ( r_unit.test( filename ) ) {
					units.push( filename );
				}
			}
		} );
	} )( dir, tree );
	return {
		units: units,
		cleanup: function() {
			var index = endAction.length;
			while( index-- ) {
				endAction[ index ]();
			}
		}
	};
}

var unitDir = path.join( __dirname, "unit" );
var fixtureDir = path.join( __dirname, "fixture" );

fs.mkdirSync( fixtureDir );

var units = [];
var cleanup = [];

fs.readdirSync( unitDir ).forEach( function( unitFilename ) {
	unitFilename = path.join( unitDir, unitFilename );
	var tree = generateTree( path.join( fixtureDir, path.basename( unitFilename, ".js" ) ), require( unitFilename ) );
	units.push.apply( units, tree.units );
	cleanup.push( tree.cleanup );
} );

nodeunit.reporters.default.run( units, null, function( error ) {
	cleanup.forEach( function( cleanup ) {
		cleanup();
	} );
	fs.rmdirSync( fixtureDir );
	if ( error ) {
		console.error( error );
		throw error;
	}
} );
