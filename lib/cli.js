"use strict";

const { basename, extname, resolve } = require( `path` );
const { spawn } = require( `child_process` );
const { version } = require( `../package.json` );

const rVersion = /^(?:-v|--version)$/;

const SUPPORTS_REGISTER = Boolean( require( `module` ).register );

module.exports = options => {

    // get everything
    const [ command, , ...args ] = options.argv;

    // specials
    if ( rVersion.test( args[ 0 ] || `` ) ) {
        options.log( `v${ version } (${ basename( command, extname( command ) ) } ${ process.version })` );
        options.exit( 0 );
        return undefined;
    }
    return spawn(
        command,
        [
            `--require=${ resolve( __dirname, `../index.js` ) }`,
            SUPPORTS_REGISTER ?
                `--import=${ resolve( __dirname, `./registerLoader.mjs` ) }` :
                `--loader=${ resolve( __dirname, `../loader.mjs` ) }`,
            ...args,
        ],
        {
            "stdio": options.stdio,
        }
    ).on( `close`, options.exit );
};
