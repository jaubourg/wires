"use strict";

var cache = require( "./cache" );

function buildObject( key, value, _object ) {
	_object = _object || {};
	key = key.split( "." );
	var last = key.pop();
	var object = _object;
	key.forEach( function( part ) {
		if ( !object.hasOwnProperty( part ) ) {
			object[ part ] = {};
		}
		object = object[ part ];
	} );
	object[ last ] = value;
	return _object;
}

var rConfig = /wires:(.+)/;
var rValued = /=/;

function getFor( args ) {
	var object;
	var tmp;
	function handleExpression( expr ) {
		expr = expr.split( "=" );
		object = buildObject( expr[ 0 ], expr[ 1 ], object );
	}
	for ( var i = 0; i < args.length; ) {
		if ( ( tmp = rConfig.exec( args[ i ] ) ) ) {
			tmp = tmp[ 1 ];
			if ( rValued.test( tmp ) ) {
				tmp.split( "," ).forEach( handleExpression );
				args.splice( i, 1 );
			} else {
				object = buildObject( tmp, args[ i + 1 ], object );
				args.splice( i, 2 );
			}
		} else {
			i++;
		}
	}
	return object;
}

cache( process.cwd() )._add( getFor( process.argv ) );
