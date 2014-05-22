"use strict";

module.exports = function( file ) {
	try {
		return require( file );
	} catch( e ) {
		if ( e.code !== "MODULE_NOT_FOUND" ) {
			throw e;
		}
	}
};
