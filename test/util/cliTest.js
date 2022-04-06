"use strict";

const cli = require( `${ process.env.WIRES_DIR }/lib/cli` );

// eslint-disable-next-line max-statements
module.exports = ( argv, callback, cwd, nodeEnv ) => __ => {
    let stdout = ``;
    let stderr = ``;
    let exitMarker = {};
    let exitCode;
    const finish = () => {
        setTimeout( callback, 0, __, stdout, stderr, exitCode );
    };
    let childProcess;
    let previousCwd;
    let previousNodeEnv;
    if ( cwd ) {
        previousCwd = process.cwd();
        process.chdir( cwd );
    }
    if ( typeof nodeEnv === `string` ) {
        previousNodeEnv = process.env[ `WIRES_ENV` ];
        process.env[ `WIRES_ENV` ] = nodeEnv;
    }
    try {
        childProcess = cli( {
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
        if ( typeof previousNodeEnv === `string` ) {
            process.env[ `WIRES_ENV` ] = previousNodeEnv;
        }
    }
    childProcess.stdio[ 1 ].on( `data`, buffer => ( stdout += buffer ) );
    childProcess.stdio[ 2 ].on( `data`, buffer => ( stderr += buffer ) );
    return undefined;
};
