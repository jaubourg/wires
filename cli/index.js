"use strict";

const path = require( `path` );

module.exports = options => {

    // get everything
    const [ command, , ...args ] = options.argv;

    // deduce the engine name
    const engineName = path.basename( command, path.extname( command ) );

    // get help/error display
    const help = errorMessage => {
        const helpText =
            require( `fs` ).readFileSync( path.join( __dirname, `./help.txt` ) )
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

    // do we have an info call?
    if ( args.length ) {
        const info = infoOptions.get( args[ 0 ] );
        if ( info ) {
            info();
        }
    } else {
        help( `arguments expected` );
    }

    // and *boom*, we have our own wires-enabled node here :)
    return require( `child_process` )
        .spawn(
            command,
            [
                `--require=${ path.resolve( __dirname, `../index.js` ) }`,
                `--loader=${ path.resolve( __dirname, `../loader.mjs` ) }`,
                ...args,
            ],
            {
                "stdio": options.stdio,
            }
        )
        .on( `close`, options.exit );
};
