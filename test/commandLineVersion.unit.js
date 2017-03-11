"use strict";

var commandLineTest = require( "./helper/commandLineTest" );

var versionString = "v" + require( "../package" ).version + " (some_exe " + process.version + ")\n";

module.exports = {
    "short": commandLineTest( [
        "some_exe",
        "script.js",
        "-v"
    ], function( __, stdout, stderr, exitCode ) {
        __.expect( 3 );
        __.strictEqual( stdout, versionString, "version string properly created" );
        __.strictEqual( stderr, "", "nothing on stderr" );
        __.strictEqual( exitCode, 0, "exit code is 0" );
        __.done();
    } ),
    "long": commandLineTest( [
        "some_exe",
        "script.js",
        "--version"
    ], function( __, stdout, stderr, exitCode ) {
        __.expect( 3 );
        __.strictEqual( stdout, versionString, "version string properly created" );
        __.strictEqual( stderr, "", "nothing on stderr" );
        __.strictEqual( exitCode, 0, "exit code is 0" );
        __.done();
    } ),
    "short circuit": commandLineTest( [
        "some_exe",
        "script.js",
        "-v",
        "someScript.js"
    ], function( __, stdout, stderr, exitCode ) {
        __.expect( 3 );
        __.strictEqual( stdout, versionString, "version string properly created" );
        __.strictEqual( stderr, "", "nothing on stderr" );
        __.strictEqual( exitCode, 0, "exit code is 0" );
        __.done();
    } ),
};
