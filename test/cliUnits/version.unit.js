"use strict";

const cliTest = require( `../util/cliTest` );

const versionString = `v${ require( `../../package` ).version } (some_exe ${ process.version })\n`;

module.exports = {
    "short": cliTest( [
        `some_exe`,
        `script.js`,
        `-v`,
    ], ( __, stdout, stderr, exitCode ) => {
        __.expect( 3 );
        __.strictEqual( stdout, versionString, `version string properly created` );
        __.strictEqual( stderr, ``, `nothing on stderr` );
        __.strictEqual( exitCode, 0, `exit code is 0` );
        __.done();
    } ),
    "long": cliTest( [
        `some_exe`,
        `script.js`,
        `--version`,
    ], ( __, stdout, stderr, exitCode ) => {
        __.expect( 3 );
        __.strictEqual( stdout, versionString, `version string properly created` );
        __.strictEqual( stderr, ``, `nothing on stderr` );
        __.strictEqual( exitCode, 0, `exit code is 0` );
        __.done();
    } ),
    "short circuit": cliTest( [
        `some_exe`,
        `script.js`,
        `-v`,
        `someScript.js`,
    ], ( __, stdout, stderr, exitCode ) => {
        __.expect( 3 );
        __.strictEqual( stdout, versionString, `version string properly created` );
        __.strictEqual( stderr, ``, `nothing on stderr` );
        __.strictEqual( exitCode, 0, `exit code is 0` );
        __.done();
    } ),
};
