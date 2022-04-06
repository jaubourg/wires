"use strict";

const cliTest = require( `../../util/cliTest` );
const path = require( `path` );

const fixtureDir = path.resolve( __dirname, `../fixture/commandLine` );
const rootDir = process.env.WIRES_DIR;

const rWarningLines = /^\(.+$/gm;

module.exports = {
    "full test": cliTest( [
        process.execPath,
        `executable-name`,
        `--throw-deprecation`,
        path.resolve( fixtureDir, `script.js` ),
        `arg_for_script`,
        `debug`,
        `--throw-deprecaton`,
    ], ( __, _, stderr, exitCode ) => {
        __.plan( 2 );
        __.strictEqual( exitCode, 180, `correct exit code (1204)` );
        __.deepEqual( JSON.parse( stderr.replace( rWarningLines, `` ) ), {
            "noParent": false,
            "isMain": true,
            "argv": [
                process.execPath,
                path.resolve( fixtureDir, `script.js` ),
                `arg_for_script`,
                `debug`,
                `--throw-deprecaton`,
            ],
            "execArgv": [
                `--require=${ path.resolve( rootDir, `index.js` ) }`,
                `--throw-deprecation`,
                `--loader=${ path.resolve( rootDir, `loader.mjs` ) }`,
            ],
            "config": {
                "string": `value`,
                "object": {
                    "a": `a`,
                    "b": `b`,
                    "c": `c`,
                },
            },
        }, `everything has been properly transmitted` );
        __.end();
    }, fixtureDir ),
    "missing script": cliTest( [
        process.execPath,
        `executable-name`,
    ], ( __, _, stderr, exitCode ) => {
        __.plan( 2 );
        __.strictEqual( exitCode, -1, `correct exit code (-1)` );
        const errorMessage = `ERROR: path_to_script required`;
        __.strictEqual( stderr.substr( 0, errorMessage.length ), errorMessage, `correct error message` );
        __.end();
    } ),
};

for ( const option of [ `-e`, `--eval`, `-i`, `--interactive`, `-p`, `--print` ] ) {
    module.exports[ `forbidden option ${ option }` ] = cliTest( [
        process.execPath,
        `executable-name`,
        option,
    ], ( __, _, stderr, exitCode ) => {
        __.plan( 2 );
        __.strictEqual( exitCode, -1, `correct exit code (-1)` );
        const command = process.execPath;
        const errorMessage = `ERROR: ${ path.basename( command, path.extname( command ) ) } option not supported`;
        __.strictEqual( stderr.substr( 0, errorMessage.length ), errorMessage, `correct error message` );
        __.end();
    } );
}
