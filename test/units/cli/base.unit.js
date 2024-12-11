"use strict";

const cliTest = require( `../../util/cliTest` );
const path = require( `path` );

const fixtureDir = path.resolve( __dirname, `../fixture/commandLine` );
const rootDir = process.env.WIRES_DIR;

const SUPPORTS_REGISTER = Boolean( require( `module` ).register );

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
        __.deepEqual( JSON.parse( stderr ), {
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
                SUPPORTS_REGISTER ?
                    `--import=${ path.resolve( rootDir, `lib/registerLoader.mjs` ) }` :
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
};
