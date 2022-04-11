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
                `--loader=${ path.resolve( rootDir, `loader.mjs` ) }`,
                `--throw-deprecation`,
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
    }, fixtureDir ),
    "missing arguments": cliTest( [
        process.execPath,
        `executable-name`,
    ], ( __, _, stderr, exitCode ) => {
        __.plan( 2 );
        __.strictEqual( exitCode, -1, `correct exit code (-1)` );
        const errorMessage = `ERROR: arguments expected`;
        __.strictEqual( stderr.substr( 0, errorMessage.length ), errorMessage, `correct error message` );
    } ),
};
