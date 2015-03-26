"use strict";

var fs = require( "fs" );
var path = require( "path" );
var wrench = require( "wrench" );

function command( module ) {
	return path.resolve( __dirname, "node_modules/.bin/" + module + ( path.sep === "/" ? "" : ".cmd" ) );
}

module.exports = function( grunt ) {

	var lib = path.resolve( __dirname, "lib" );
	var libSave = lib + "-save";

	var lcov = "data.lcov";

	grunt.initConfig( {
		shell: {
			coveralls: {
				command: command( "coveralls" ) + " < " + lcov
			},
			jscoverage: {
				command: command( "jscoverage" ) + " " + lib + " " + libSave
			},
			test: {
				command: "node test --reporter=lcov > " + lcov
			}
		}
	} );

	// load npm modules
	require( "load-grunt-tasks" )( grunt );

	grunt.registerTask( "switch-lib", function() {
		fs.renameSync( lib, "tmp" );
		fs.renameSync( libSave, lib );
		fs.renameSync( "tmp", libSave );
	} );

	grunt.registerTask( "lib-back", function() {
		wrench.rmdirSyncRecursive( lib );
		fs.renameSync( libSave, lib );
	} );

	grunt.registerTask( "cleanup", function() {
		fs.unlinkSync( lcov );
	} );

	// Tasks
	grunt.registerTask( "default", [
		"shell:jscoverage",
		"switch-lib",
		"shell:test",
		"lib-back",
		"shell:coveralls",
		"cleanup"
	] );

};
