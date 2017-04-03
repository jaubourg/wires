"use strict";

const commandLineTest = require( `../commandLineTest` );
const path = require( `path` );

const fixtureDir = path.resolve( __dirname, `../data/commandLine` );

module.exports = {
    "full test": commandLineTest( [
        process.execPath,
        path.resolve( __dirname, `../../lib/wires` ),
        `(object.a=1)`,
        `--throw-deprecation`,
        path.resolve( fixtureDir, `script.js` ),
    ], ( __, stdout, stderr, exitCode ) => {
        __.expect( 2 );
        __.strictEqual( exitCode, 180, `correct exit code (1204)` );
        __.deepEqual( JSON.parse( stderr ), {
            "noParent": true,
            "isMain": true,
            "argv": [
                path.resolve( __dirname, `../../lib/wires` ),
                path.resolve( fixtureDir, `script.js` ),
            ],
            "execArgv": [
                `--throw-deprecation`,
            ],
            "config": {
                "string": `value`,
                "object": {
                    "a": 1,
                    "b": `b`,
                    "c": `c`,
                },
            },
        }, `everything has been properly transmitted` );
        __.done();
    }, fixtureDir ),
    "missing script": commandLineTest( [
        process.execPath,
        path.resolve( __dirname, `../../lib/wires` ),
    ], ( __, _, stderr, exitCode ) => {
        __.expect( 2 );
        __.strictEqual( exitCode, -1, `correct exit code (-1)` );
        const errorMessage = `ERROR: path_to_script required`;
        __.strictEqual( stderr.substr( 0, errorMessage.length ), errorMessage, `correct error message` );
        __.done();
    } ),
};

for ( const option of [ `-e`, `--eval`, `-i`, `--interactive`, `-p`, `--print` ] ) {
    module.exports[ `forbidden option ${ option }` ] = commandLineTest( [
        process.execPath,
        path.resolve( __dirname, `../../lib/wires` ),
        option,
    ], ( __, _, stderr, exitCode ) => {
        __.expect( 2 );
        __.strictEqual( exitCode, -1, `correct exit code (-1)` );
        const command = process.execPath;
        const errorMessage = `ERROR: ${ path.basename( command, path.extname( command ) ) } option not supported`;
        __.strictEqual( stderr.substr( 0, errorMessage.length ), errorMessage, `correct error message` );
        __.done();
    } );
}
