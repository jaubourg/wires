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

var unitDir = __dirname;
var fixtureDir = path.join( __dirname, "fixture" );

var dirUnits = {};
var units = [];

fs.readdirSync( unitDir ).forEach( function( basename ) {
    if ( options.map && !options.map[ basename ] ) {
        return;
    }
    var filename = path.join( unitDir, basename );
    if ( rUnit.test( filename ) ) {
        units.push( filename );
    } else if ( rDirUnit.test( filename ) ) {
        dirUnits[ "/" + path.basename( filename, ".dirunit.js" ) ] = require( filename );
    }
} );

process.on( "exit", function() {
    try {
        fse.removeSync( fixtureDir );
    } catch ( e ) {}
} );

( function generateTree( dir, tree ) {
    fs.mkdirSync( dir );
    _.forOwn( tree, function( val, key ) {
        var filename;
        if ( key[ 0 ] === "/" ) {
            generateTree( path.join( dir, key.substr( 1 ) ), val, units );
        } else {
            filename = path.join( dir, key );
            fs.writeFileSync(
                filename,
                typeof val === "function" ?
                    "\"use strict\";\n" + String( val ).replace( rCleanFunction, "" ) :
                    JSON.stringify( val, null, "    " ),
                "utf8"
            );
            if ( rUnit.test( filename ) ) {
                units.push( filename );
            }
        }
    } );
} )( fixtureDir, dirUnits );

// eslint-disable-next-line no-extend-native
Object.prototype.__MODIFIED_PROTOTYPE = true;

( nodeunit.reporters[ options.reporter ] || nodeunit.reporters.default ).run( units, null, function( error ) {
    if ( error ) {
        // eslint-disable-next-line no-console
        console.error( error );
        throw error;
    }
} );
