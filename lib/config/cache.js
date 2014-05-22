var cashe = require( "cashe" );
var forOwn = require( "lodash" ).forOwn;
var merge = require( "./../util/merge");
var path = require( "path" );
var requireIfExists = require( "./../util/requireIfExists" );

var getFor = module.exports = cashe( function( dir ) {
	var parentDir = path.dirname( dir );
	var configFile = path.join( dir, "wires.json" );
	var rawConfig = merge(
		{},
		requireIfExists( configFile ),
		process.env.WIRES && requireIfExists( path.join( dir, "wires." + process.env.WIRES + ".json" ) )
	);
	var config = {
		module: require.cache[ configFile ],
		parent: parentDir !== dir && getFor( parentDir ),
		data: {},
		routes: {
		}
	};
	forOwn( rawConfig, function( value, key ) {
		( key[ 0 ] === ":" ? config.routes : config.data )[ key ] = value;
	} );
	if ( config.parent ) {
		config.data = merge( {}, config.parent.data, config.data );
		if ( !config.module ) {
			config.module = config.parent.module;
		}
	}
	return config;
} );
