"use strict";

const cli = require( `${ process.env.WIRES_DIR }/cli` );

// eslint-disable-next-line max-statements
module.exports = ( argv, callback, cwd, nodeEnv ) => __ => new Promise( ( resolve, reject ) => {
    let stdout = ``;
    let stderr = ``;
    let exitCode;
    const finish = error => setTimeout( () => {
        if ( error ) {
            reject( error );
        } else {
            resolve( callback( __, stdout, stderr, exitCode ) );
        }
    }, 0 );
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
        let done = false;
        const childProcess = cli( {
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
                if ( !done ) {
                    // eslint-disable-next-line no-throw-literal
                    throw undefined;
                }
                finish();
            },
        } );
        done = true;
        if ( exitCode === undefined ) {
            childProcess.stdio[ 1 ].on( `data`, buffer => ( stdout += buffer ) );
            childProcess.stdio[ 2 ].on( `data`, buffer => ( stderr += buffer ) );
        }
    } catch ( error ) {
        finish( error );
        return;
    } finally {
        if ( cwd ) {
            process.chdir( previousCwd );
        }
        if ( typeof previousNodeEnv === `string` ) {
            process.env[ `WIRES_ENV` ] = previousNodeEnv;
        }
    }
} );
