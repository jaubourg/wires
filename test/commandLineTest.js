"use strict";

const commandLine = require( `../lib/cli` );

module.exports = function( argv, callback, cwd ) {
    return function( __ ) {
        let stdout = ``;
        let stderr = ``;
        let exitMarker = {};
        let exitCode;
        const finish = () => {
            setTimeout( callback, 0, __, stdout, stderr, exitCode );
        };
        let childProcess;
        let previousCwd;
        if ( cwd ) {
            previousCwd = process.cwd();
            process.chdir( cwd );
        }
        try {
            childProcess = commandLine( {
                argv,
                "stdio": `pipe`,
                log( message ) {
                    stdout += `${ message }\n`;
                },
                error( message ) {
                    stderr += `${ message }\n`;
                },
                exit( code ) {
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
        childProcess.stdio[ 1 ].on( `data`, buffer => ( stdout += buffer ) );
        childProcess.stdio[ 2 ].on( `data`, buffer => ( stderr += buffer ) );
        return undefined;
    };
};
