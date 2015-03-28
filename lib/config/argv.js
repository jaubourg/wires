"use strict";

function addToObject( root, key, value ) {
	key = key.split( "." );
	var last = key.pop();
	var current = root;
	key.forEach( function( part ) {
		if ( !current.hasOwnProperty( part ) ) {
			current[ part ] = {};
		}
		current = current[ part ];
	} );
	current[ last ] = value;
}

var rOverride = require( "./rOverride" );
var rSet = /^([^=]+)=(.*)$/;
var rFlag = /^(!?)(.*)$/;

process.argv = process.argv.filter( function( arg ) {
	if ( !rOverride.test( arg ) ) {
		return true;
	}
	arg.slice( 1, -1 ).split( "," ).forEach( function( expr ) {
		if ( !expr ) {
			return;
		}
		var test;
		var key;
		var value;
		if ( ( test = rSet.exec( expr ) ) ) {
			key = test[ 1 ];
			try {
				value = JSON.parse( test[ 2 ].replace( "'", "\"" ) );
			} catch ( e ) {
				value = test[ 2 ];
			}
		} else if ( ( test = rFlag.exec( expr ) ) ) {
			key = test[ 2 ];
			value = !test[ 1 ];
		}
		if ( test ) {
			addToObject( module.exports, key, value );
		}
	} );
	return false;
} );
