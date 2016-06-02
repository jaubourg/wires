"use strict";

var options = ( function( args ) {
	var rOptions = /^--([a-z]+)=(.+)$/i;
	var actualOptions = {};
	args.forEach( function( arg ) {
		var tmp = rOptions.exec( arg );
		if ( tmp ) {
			actualOptions[ tmp[ 1 ] ] = tmp[ 2 ].trim();
		} else {
			if ( !actualOptions.map ) {
				actualOptions.map = {};
			}
			actualOptions.map[ arg + ".js" ] = true;
		}
	} );
	return actualOptions;
} )( process.argv.slice( 2 ) );

var _ = require( "lodash" );
var fs = require( "fs" );
var fse = require( "fs-extra" );
var nodeunit = require( "nodeunit" );
var path = require( "path" );

var rCleanFunction = /^.*\r?\n|\r?\n.*$/g;

var rDirUnit = /\.dirunit\.js$/;
var rUnit = /\.unit\.js$/;

function generateTree( dir, tree, units ) {
	fs.mkdirSync( dir );
	_.forOwn( tree, function( val, filename ) {
		if ( filename[ 0 ] === "/" ) {
			generateTree( path.join( dir, filename.substr( 1 ) ), val, units );
		} else {
			filename = path.join( dir, filename );
			fs.writeFileSync(
				filename,
				typeof val === "function" ?
					"\"use strict\";\n" + ( val + "" ).replace( rCleanFunction, "" ) :
					JSON.stringify( val, null, "  " ),
				"utf8"
			);
			if ( rUnit.test( filename ) ) {
				units.push( filename );
			}
		}
	} );
}

var unitDir = __dirname;
var fixtureDir = path.join( __dirname, "fixture" );

var tree = {};
var units = [];

fs.readdirSync( unitDir ).forEach( function( unitFilename ) {
	if ( options.map && !options.map[ unitFilename ] ) {
		return;
	}
	unitFilename = path.join( unitDir, unitFilename );
	if ( rUnit.test( unitFilename ) ) {
		units.push( unitFilename );
		return;
	}
	if ( rDirUnit.test( unitFilename ) ) {
		tree[ "/" + path.basename( unitFilename, ".dirunit.js" ) ] = require( unitFilename );
	}
} );

process.on( "exit", function() {
	try {
		fse.removeSync( fixtureDir );
	} catch ( e ) {}
} );

generateTree( fixtureDir, tree, units );

// jshint freeze:false
Object.prototype.__TEST_WHEN_OBJECT_PROTOTYPE_IS_MODIFIED = true;

( nodeunit.reporters[ options.reporter ] || nodeunit.reporters.default ).run( units, null, function( error ) {
	if ( error ) {
		console.error( error );
		throw error;
	}
} );
