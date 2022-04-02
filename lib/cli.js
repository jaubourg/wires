"use strict";

const fs = require( `fs` );
const path = require( `path` );

const rCommand = /^-/;
const rOverride = /^\([^)]*\)$/;

function generateCall( name, param ) {
    return `${ name }(${ JSON.stringify( param ) })`;
}

const notSupportedArray = [ `-e`, `--eval`, `-i`, `--interactive`, `-p`, `--print` ];
const notSupported = new Set( notSupportedArray );

module.exports = function( options ) {

    // get the command
    const [ command ] = options.argv;

    // deduce the engine name
    const engineName = path.basename( command, path.extname( command ) );

    // get help/error display
    const help = errorMessage => {
        const helpText =
            fs.readFileSync( path.join( __dirname, `./help.txt` ) )
                .toString()
                .replace( /ENGINE/g, engineName );
        if ( errorMessage ) {
            options.error( `ERROR: ${ errorMessage }\n` );
            options.error( helpText );
            options.exit( -1 );
        } else {
            options.log( helpText );
            options.exit( 0 );
        }
    };

    // wires info options
    const version = () => {
        options.log( `v${ require( `../package` ).version } (${ engineName } ${ process.version })` );
        options.exit( 0 );
    };
    const infoOptions = new Map( [
        [ `-h`, help ],
        [ `--help`, help ],
        [ `-v`, version ],
        [ `--version`, version ],
    ] );

    // let's get the target script and args
    let targetScript;
    const nodeArgs = [];
    const scriptArgs = [
        options.argv[ 1 ],
        undefined,
    ];

    options.argv.forEach( ( arg, i ) => {
        if ( i <= 1 ) {
            return;
        }
        // we already found the targetScript
        if ( targetScript ) {
            scriptArgs.push( arg );

        // if this is a -xxx argument
        } else if ( rCommand.test( arg ) ) {

            // refuse eval-related ones
            if ( notSupported.has( arg ) ) {
                help( `${ engineName } option not supported (${ notSupportedArray.join( `, ` ) })` );
            }

            // handle info options
            const infoOption = infoOptions.get( arg );
            if ( infoOption ) {
                infoOption();
            }

            // keep the argument
            nodeArgs.push( arg );

        // handle the special case of debug
        } else if ( arg === `debug` ) {
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
        help( `path_to_script required` );
    }

    nodeArgs.push( `--loader`, path.resolve( __dirname, `loader.mjs` ) );

    nodeArgs.push( `-e`, generateCall(
        generateCall(
            `require`,
            path.resolve( __dirname, `exec.js` )
        ),
        scriptArgs
    ) );

    // and *boom*, we have our own wires-enabled node here :)
    return require( `child_process` )
        .spawn( command, nodeArgs, {
            "stdio": options.stdio,
        } )
        .on( `close`, options.exit );
};
