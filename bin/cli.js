"use strict";

var fs = require( "fs" );
var path = require( "path" );

var rCommand = /^-/;
var rOverride = /^\([^)]*\)$/;

function generateCall( name, param ) {
    return name + "(" + JSON.stringify( param ) + ")";
}

var notSupported = {
    "-e": true,
    "--eval": true,
    "-i": true,
    "--interactive": true,
    "-p": true,
    "--print": true,
};

module.exports = function( options ) {

    // get the command
    var command = options.argv[ 0 ];

    // deduce the engine name
    var engineName = path.basename( command, path.extname( command ) );

    // get help/error disply
    function help( errorMessage ) {
        var helpText =
            fs.readFileSync( path.join( __dirname, "..", "data", "help.txt" ) )
            .toString()
            .replace( /ENGINE/g, engineName );
        if ( errorMessage ) {
            options.error( "ERROR: " + errorMessage + "\n" );
            options.error( helpText );
            options.exit( -1 );
        } else {
            options.log( helpText );
            options.exit( 0 );
        }
    }

    // wires info options
    var wiresInfoOptions = {
        "--help": help,
        "--version": function() {
            options.log( "v" + require( "../package" ).version + " (" + engineName + " " + process.version + ")" );
            options.exit( 0 );
        },
        "-h": "--help",
        "-v": "--version",
    };

    // let's get the target script and args
    var targetScript;
    var nodeArgs = [];
    var scriptArgs = [
        options.argv[ 1 ],
        undefined
    ];

    options.argv.forEach( function( arg, i ) {
        if ( i <= 1 ) {
            return;
        }
        // we already found the targetScript
        if ( targetScript ) {
            scriptArgs.push( arg );

        // if this is a -xxx argument
        } else if ( rCommand.test( arg ) ) {

            // refuse eval-related ones
            if ( notSupported[ arg ] ) {
                help( engineName + " option not supported (" +
                    Object.getOwnPropertyNames( notSupported ).join( ", " ) + ")" );
            }

            // handle info options
            if ( wiresInfoOptions[ arg ] ) {
                if ( typeof wiresInfoOptions[ arg ] === "string" ) {
                    arg = wiresInfoOptions[ arg ];
                }
                wiresInfoOptions[ arg ]();
            }

            // keep the argument
            nodeArgs.push( arg );

        // handle the special case of debug
        } else if ( arg === "debug" ) {
            nodeArgs.push( arg );

        // store as override when needed
        } else if ( rOverride.test( arg ) ) {

            scriptArgs.push( arg );

        // we found our target script
        } else {
            targetScript = path.resolve( process.cwd(), arg );
            scriptArgs[ 1 ] = targetScript;
        }
    } );

    // no script, no dice
    if ( !targetScript ) {
        help( "path_to_script required" );
    }

    nodeArgs.push( "-e", generateCall(
        generateCall(
            "require",
            path.resolve( __dirname, "exec.js" )
        ),
        scriptArgs
    ) );

    // and *boom*, we have our own wires-enabled node here :)
    return require( "child_process" )
        .spawn( command, nodeArgs, {
            "stdio": options.stdio,
        } )
        .on( "close", options.exit );
};
