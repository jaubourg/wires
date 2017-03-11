"use strict";

var fs = require( "fs" );
var fse = require( "fs-extra" );
var path = require( "path" );

function command( expr ) {
    var array = expr.split( " " );
    array[ 0 ] = path.resolve( __dirname, "node_modules/.bin/" + array[ 0 ] + ( path.sep === "/" ? "" : ".cmd" ) );
    return array.join( " " );
}

module.exports = function( grunt ) {
    var lcov = "data.lcov";
    var lib = "lib";
    var libSave = lib + "-save";
    var lintTargets = [ "*.js", "lib/**/*.js", "test/**/*.js", "bin/wires" ];

    grunt.initConfig( {
        "eslint": {
            "files": lintTargets,
        },
        "shell": {
            "coveralls": {
                "command": command( "coveralls < " + lcov ),
            },
            "jscoverage": {
                "command": command( "jscoverage " + lib + " " + libSave ),
            },
            "test": {
                "command": "node bin/wires test",
            },
            "testWithCoverage": {
                "command": "node bin/wires test --reporter=lcov > " + lcov,
            },
        },
    } );

    var eslintLoaded = false;

    // load npm modules
    grunt.loadNpmTasks( "grunt-shell" );
    try {
        grunt.loadNpmTasks( "grunt-eslint" );
        eslintLoaded = true;
    } catch ( e ) {
        // grunt-eslint will fail on older versions of node
    }

    // tasks
    grunt.registerTask( "default", eslintLoaded ? [ "eslint", "shell:test" ] : [ "shell:test" ] );

    // coverage
    grunt.registerTask( "coverage-file-manipulation", function() {
        fs.renameSync( lib, "__coverage_tmp" );
        fs.renameSync( libSave, lib );
        fs.renameSync( "__coverage_tmp", libSave );
        process.on( "exit", function() {
            fse.removeSync( lib );
            fs.renameSync( libSave, lib );
            fs.unlinkSync( lcov );
        } );
    } );

    grunt.registerTask( "coverage", [
        "shell:jscoverage",
        "coverage-file-manipulation",
        "shell:testWithCoverage",
        "shell:coveralls"
    ] );
};
