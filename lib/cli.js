"use strict";

var resolve = require( "path" ).resolve;

function tempFile( content ) {
	var fs = require( "fs" );
	var temp = require( "temp" );
	temp.track();
	var file = temp.openSync( "wires" );
	fs.writeSync( file.fd, content );
	fs.close( file.fd );
	return file.path;
}

function error( message ) {
	console.error( message );
	process.exit( -1 );
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

var rCommand = /^-/;

// Get the command
var command = process.argv[ 0 ];

// Get this very binary
var self = process.argv[ 2 ];

// Get the command-line arguments
var argv = process.argv.slice( 2 );

// Let's get the target script and args
var targetScript;
var args = [];

var length = argv.length;
var arg;

for ( var i = 0; !targetScript && i < length; i++ ) {
	arg = argv[ i ];
	// If this is a -something argument
	if ( rCommand.test( arg ) ) {
		// Refuse eval-related ones
		if ( evaluators[ arg ] ) {
			error( "wires does not support -e and -p options" );
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
	error( "wires does not support interactive mode" );
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
