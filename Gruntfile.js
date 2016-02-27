"use strict";

var fs = require( "fs" );
var path = require( "path" );
var wrench = require( "wrench" );

function command( expr ) {
	expr = expr.split( " " );
	expr[ 0 ] = path.resolve( __dirname, "node_modules/.bin/" + expr[ 0 ] + ( path.sep === "/" ? "" : ".cmd" ) );
	return expr.join( " " );
}

module.exports = function( grunt ) {

	var lcov = "data.lcov";
	var lib = "lib";
	var libSave = lib + "-save";
	var lintTargets = [ "*.js", "lib/**/*.js", "test/**/*.js", "bin/wires" ];

	grunt.initConfig( {
		jscs: {
			files: lintTargets,
			options: {
				config: ".jscsrc"
			}
		},
		jshint: {
			files: lintTargets,
			options: {
				jshintrc: ".jshintrc"
			}
		},
		shell: {
			coveralls: {
				command: command( "coveralls < " + lcov )
			},
			jscoverage: {
				command: command( "jscoverage " + lib + " " + libSave )
			},
			test: {
				command: "node bin/wires test"
			},
			testWithCoverage: {
				command: "node bin/wires test --reporter=lcov > " + lcov
			}
		}
	} );

	// load npm modules
	require( "load-grunt-tasks" )( grunt );

	// Tasks
	grunt.registerTask( "lint", [ "jscs", "jshint" ] );
	grunt.registerTask( "default", [ "lint", "shell:test" ] );

	// Coverage
	grunt.registerTask( "coverage-file-manipulation", function() {
		fs.renameSync( lib, "__coverage_tmp" );
		fs.renameSync( libSave, lib );
		fs.renameSync( "__coverage_tmp", libSave );
		process.on( "exit", function() {
			wrench.rmdirSyncRecursive( lib );
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
