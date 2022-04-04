"use strict";

const cliTest = require( `../../util/cliTest` );

const helpString =
    `${ require( `fs` ).readFileSync( require( `path` ).resolve( __dirname, `../../../lib/help.txt` ), `utf8` )
        .replace( /ENGINE/g, `some_exe` ) }\n`;

module.exports = {
    "short": cliTest( [
        `some_exe`,
        `script.js`,
        `-h`,
    ], ( __, stdout, stderr, exitCode ) => {
        __.plan( 3 );
        __.strictEqual( stdout, helpString, `help string properly created` );
        __.strictEqual( stderr, ``, `nothing on stderr` );
        __.strictEqual( exitCode, 0, `exit code is 0` );
        __.end();
    } ),
    "long": cliTest( [
        `some_exe`,
        `script.js`,
        `--help`,
    ], ( __, stdout, stderr, exitCode ) => {
        __.plan( 3 );
        __.strictEqual( stdout, helpString, `help string properly created` );
        __.strictEqual( stderr, ``, `nothing on stderr` );
        __.strictEqual( exitCode, 0, `exit code is 0` );
        __.end();
    } ),
    "short circuit": cliTest( [
        `some_exe`,
        `script.js`,
        `-h`,
        `someScript.js`,
    ], ( __, stdout, stderr, exitCode ) => {
        __.plan( 3 );
        __.strictEqual( stdout, helpString, `help string properly created` );
        __.strictEqual( stderr, ``, `nothing on stderr` );
        __.strictEqual( exitCode, 0, `exit code is 0` );
        __.end();
    } ),
};
