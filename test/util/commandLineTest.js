"use strict";

var commandLine = require( "../../lib/cli" );
var stream = require( "stream" );

function stdStream() {
	var self = new stream.Writable();
	var string = "";
	self._write = function( chunk, encoding, callback ) {
		string += chunk;
		callback();
	};
	self.getString = function() {
		return string;
	};
	return self;
}

module.exports = function( argv, callback ) {
	return function( __ ) {
		var stdout = stdStream();
		var stderr = stdStream();
		var exitMarker = {};
		var exitCode;
		function errorListener( error ) {
			process.removeListener( "error", errorListener );
			if ( error !== exitMarker ) {
				throw error;
			}
			callback( __, stdout.getString(), stderr.getString(), exitCode );
		}
		process.addListener( "error", errorListener );
		try {
			commandLine( {
				argv: argv,
				stdio: [ process.stdin, stdout, stderr ],
				log: function( message ) {
					stdout.write( message + "\n" );
				},
				error: function( message ) {
					stderr.write( message + "\n" );
				},
				exit: function( code ) {
					exitCode = code;
					throw exitMarker;
				}
			} );
		} catch ( error ) {
			errorListener( error );
		}
	};
};
