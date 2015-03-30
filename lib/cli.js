"use strict";

var fs = require( "fs" );
var path = require( "path" );
var temp = require( "temp" );

var rCommand = /^-/;
var rOverride = require( "./config/rOverride" );

function tempFile( content ) {
	temp.track();
	var file = temp.openSync( "wires" );
	fs.writeSync( file.fd, content );
	fs.close( file.fd );
	return file.path;
}

function generateRequire( target ) {
	return "require(" + JSON.stringify( target ) + ");\n";
}

function generateArgv( index, value ) {
	return "process.argv[ " + index + " ] = " + JSON.stringify( value ) + ";\n";
}

var notSupported = {
	"-e": true,
	"--eval": true,
	"-i": true,
	"--interactive": true,
	"-p": true,
	"--print": true
};

module.exports = function( options ) {

	// Get the command
	var command = options.argv[ 0 ];

	// Deduce the engine name
	var engineName = path.basename( command, path.extname( command ) );

	// Get help/error disply
	function help( errorMessage ) {
		var helpText = fs.readFileSync( __dirname + "/../data/help.txt" ).toString().replace( /ENGINE/g, engineName );
		if ( errorMessage ) {
			options.error( "ERROR: " + errorMessage + "\n" );
			options.error( helpText );
			options.exit( -1 );
		} else {
			options.log( helpText );
			options.exit( 0 );
		}
	}

	// Wires info options
	var wiresInfoOptions = {
		"--help": help,
		"--version": function() {
			options.log( "v" + require( "../package" ).version + " (" + engineName + " " + process.version + ")" );
			options.exit( 0 );
		},
		"-h": "--help",
		"-v": "--version"
	};

	// Get the command-line arguments
	var overrides = [];

	// Let's get the target script and args
	var targetScript;
	var targetScriptIndex;
	var args = [];

	options.argv.forEach( function( arg, i ) {
		if ( i < 2 ) {
			return;
		}
		// We already found the targetScript
		if ( targetScript ) {
			args.push( arg );

		// If this is a -xxx argument
		} else if ( rCommand.test( arg ) ) {

			// Refuse eval-related ones
			if ( notSupported[ arg ] ) {
				help( engineName + " option not supported (" +
					Object.getOwnPropertyNames( notSupported ).join( ", " ) + ")" );
			}

			// Handle info options
			if ( wiresInfoOptions[ arg ] ) {
				if ( typeof wiresInfoOptions[ arg ] === "string" ) {
					arg = wiresInfoOptions[ arg ];
				}
				wiresInfoOptions[ arg ]();
			}

			// Keep the argument
			args.push( arg );

		// Handle the special case of debug
		} else if ( arg === "debug" ) {
			args.push( arg );

		// Store as override when needed
		} else if ( rOverride.test( arg ) ) {

			// We don't need to temporary store if passed the target script
			( targetScript ? overrides : args ).push( arg );

		// We found out target script
		} else {
			targetScriptIndex = args.length;
			targetScript = arg;
			args.push( undefined );
			args.push.apply( args, overrides );
		}
	} );

	// No script, no dice
	if ( !targetScript ) {
		help( "path_to_script required" );
	}

	// Let's resolve the script location like node would
	targetScript = path.resolve( process.cwd(), targetScript );

	// Generate a temp file
	// Why you ask? Because AFAIK, node doesn't have an option to pre-include a file
	// Also, -e and -p cannot provide command line arguments to the target code so they are useless here
	args[ targetScriptIndex ] = tempFile(
		// we set the main executable as wires
		generateArgv( 0, options.argv[ 1 ] ) +
		// we set the target script as the fully resolved path (like node would)
		generateArgv( 1, targetScript ) +
		// we require wires
		generateRequire( path.resolve( __dirname, "index.js" ) ) +
		// we require the target script
		generateRequire( targetScript )
	);

	// And *boom*, we have our own wires-enabled node here :)
	return require( "child_process" ).spawn( command, args, {
		stdio: options.stdio
	} ).on( "close", options.exit );
};
