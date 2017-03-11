"use strict";

var commandLine = require( "../../lib/cli" );

module.exports = function( argv, callback, cwd ) {
    return function( __ ) {
        var stdout = "";
        var stderr = "";
        var exitMarker = {};
        var exitCode;
        function finish() {
            setTimeout( callback, 0, __, stdout, stderr, exitCode );
        }
        var childProcess;
        var previousCwd;
        if ( cwd ) {
            previousCwd = process.cwd();
            process.chdir( cwd );
        }
        try {
            childProcess = commandLine( {
                "argv": argv,
                "stdio": "pipe",
                "log": function( message ) {
                    stdout += message + "\n";
                },
                "error": function( message ) {
                    stderr += message + "\n";
                },
                "exit": function( code ) {
                    exitCode = code;
                    if ( exitMarker ) {
                        throw exitMarker;
                    }
                    finish();
                },
            } );
            exitMarker = undefined;
        } catch ( error ) {
            if ( error !== exitMarker ) {
                throw error;
            }
            return finish();
        } finally {
            if ( cwd ) {
                process.chdir( previousCwd );
            }
        }
        childProcess.stdio[ 1 ].on( "data", function( buffer ) {
            stdout += buffer;
        } );
        childProcess.stdio[ 2 ].on( "data", function( buffer ) {
            stderr += buffer;
        } );
        return undefined;
    };
};
