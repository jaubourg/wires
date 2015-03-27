"use strict";

var options = ( function( args ) {
	var rOptions = /^--([a-z]+)=(.+)$/i;
	var options = {};
	args.forEach( function( arg ) {
		var tmp = rOptions.exec( arg );
		if ( tmp ) {
			options[ tmp[ 1 ] ] = tmp[ 2 ].trim();
		} else {
			if ( !options.map ) {
				options.map = {};
			}
			options.map[ arg + ".js" ] = true;
		}
	} );
	return options;
} )( process.argv.slice( 2 ) );

var _ = require( "lodash" );
var fs = require( "fs" );
var nodeunit = require( "nodeunit" );
var path = require( "path" );

var rCleanFunction = /^.*\r?\n|\r?\n.*$/g;
var rUnit = /[\.\\\/]unit\.js$/;

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
					typeof val === "function" ?
						"\"use strict\";\n" + ( val + "" ).replace( rCleanFunction, "" ) :
						JSON.stringify( val, null, "  " ),
					"utf8"
				);
				endAction.push( function() {
					fs.unlinkSync( filename );
				} );
				if ( rUnit.test( filename ) ) {
					units.push( filename );
				}
			}
		} );
	} )( dir, tree );
	return {
		units: units,
		cleanup: function() {
			var index = endAction.length;
			while ( index-- ) {
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
	if ( options.map && !options.map[ unitFilename ] ) {
		return;
	}
	unitFilename = path.join( unitDir, unitFilename );
	var tree = generateTree( path.join( fixtureDir, path.basename( unitFilename, ".js" ) ), require( unitFilename ) );
	units.push.apply( units, tree.units );
	cleanup.push( tree.cleanup );
} );

( nodeunit.reporters[ options.reporter ] || nodeunit.reporters.default ).run( units, null, function( error ) {
	cleanup.forEach( function( cleanup ) {
		cleanup();
	} );
	fs.rmdirSync( fixtureDir );
	if ( error ) {
		console.error( error );
		throw error;
	}
} );
