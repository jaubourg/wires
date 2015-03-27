"use strict";

var fs = require( "fs" );
var path = require( "path" );
var resolve = require( "path" ).resolve;

// Get the command
var command = process.argv[ 0 ];

// Deduce the engine name
var engineName = path.basename( command, path.extname( command ) );

function tempFile( content ) {
	var temp = require( "temp" );
	temp.track();
	var file = temp.openSync( "wires" );
	fs.writeSync( file.fd, content );
	fs.close( file.fd );
	return file.path;
}

function displayHelpAndExit( exitCode ) {
	console.log( fs.readFileSync( __dirname + "/cli-help.txt" ).toString().replace( /ENGINE/g, engineName ) );
	process.exit( exitCode || 0 );
}

function error( message ) {
	console.error( "ERROR: " + message + "\n" );
	displayHelpAndExit( -1 );
}

function generateRequire( path ) {
	return "require(" + JSON.stringify( path ) + ");\n";
}

function generateArgv( index, value ) {
	return "process.argv[ " + index + " ] = " + JSON.stringify( value ) + ";\n";
}

var evaluators = {
	"-e": true,
	"--eval": true,
	"-i": true,
	"--interactive": true,
	"-p": true,
	"--print": true
};

var wiresOptions = {
	"--help": displayHelpAndExit,
	"--version": function() {
		console.log( "v" + require( "../package" ).version + " (" + engineName + " " + process.version + ")" );
		process.exit( 0 );
	},
	"-h": "--help",
	"-v": "--version"
};

// Get the command-line arguments
var argv = process.argv.slice( 2 );

// Let's get the target script and args
var targetScript;
var args = [];

var rCommand = /^-/;

var length = argv.length;
var arg;

for ( var i = 0; !targetScript && i < length; i++ ) {
	arg = argv[ i ];
	// If this is a -something argument
	if ( rCommand.test( arg ) ) {
		// Refuse eval-related ones
		if ( evaluators[ arg ] ) {
			error( "-e and -p options are not supported" );
		}
		if ( wiresOptions[ arg ] ) {
			if ( typeof wiresOptions[ arg ] === "string" ) {
				arg = wiresOptions[ arg ];
			}
			wiresOptions[ arg ]();
		}
		// Keep the argument
		args.push( arg );
	} else if ( arg === "debug" ) {
		// gotta handle this special case
		args.push( arg );
	} else {
		// If there's no dash, we found our target script
		targetScript = arg;
	}
}

// No script, no dice
if ( !targetScript ) {
	error( "path_to_script required" );
}

// Let's resolve the script location like node would
targetScript = resolve( process.cwd(), targetScript );

args.push(
	// Generate a temp file
	// Why you ask? Because AFAIK, node doesn't have an option to pre-include a file
	// Also, -e and -p cannot provide command line arguments to the target code so they are useless here
	tempFile(
		// so we require wires
		generateRequire( resolve( __dirname, "index.js" ) ) +
		// we set the main executable as wires
		generateArgv( 0, process.argv[ 1 ] ) +
		// we set the target script as the fully resolved path (like node would)
		generateArgv( 1, targetScript ) +
		// we require the target script
		generateRequire( targetScript )
	)
);

// Let's add the args meant for the target script
for ( ; i < length; i++ ) {
	args.push( argv[ i ] );
}

// And *boom*, we have our own wires-enabled node here :)
require( "child_process" ).spawn( command, args, {
	stdio: "inherit"
} ).on( "close", function( code ) {
	process.exit( code );
} );
