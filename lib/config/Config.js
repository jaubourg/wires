"use strict";

var _ = require( "lodash" );
var merge = require( "../util/merge" );
var Module = require( "module" );
var parse = require( "../util/recursiveReplace" )( /\{#([^{}]+)\}/g );
var path = require( "path" );
var requireIfExists = require( "../util/requireIfExists" );

var rHere = /[@>]\//;

function Config( directory, parent ) {
	this._directory = directory;
	var rawFiles = this._getFiles();
	if ( !this._module && parent ) {
		this._module = parent._module;
	}
	this._parent = parent;
	this._namespace = rawFiles.main && rawFiles.main.NAMESPACE;
	this
		._add( rawFiles.env )
		._add( rawFiles.main )
		._importParent()
		._add( rawFiles.envDefaults )
		._add( rawFiles.defaults );
}

Config.prototype = {
	_add: function( raw ) {
		if ( raw ) {
			var data, routes;
			_.forOwn( raw, function( value, key ) {
				( key[ 0 ] === ":" ? ( routes || ( routes = {} ) ) : ( data || ( data = {} ) ) )[ key ] = value;
			} );
			if ( routes ) {
				this._routes = this._routes ? _.defaults( this._routes, routes ) : routes;
			}
			if ( data ) {
				this._data = this._data ? merge( data, this._data ) : data;
			}
		}
		return this;
	},
	_importParent: function() {
		if ( this._parent ) {
			this._data = merge( {}, this._parent.rawValue( this._namespace ), this._data );
		}
		return this;
	},
	_getFiles: function() {
		var self = this;
		return _.mapValues( {
			main: "",
			env: process.env.WIRES ? ( "." + process.env.WIRES ) : undefined,
			defaults: "-defaults",
			envDefaults: process.env.WIRES ? ( "-defaults." + process.env.WIRES ) : undefined
		}, function( filename ) {
			if ( filename == null ) {
				return;
			}
			filename = path.resolve( self._directory, "wires" + filename + ".json" );
			var required = requireIfExists( filename );
			if ( !self._module ) {
				self._module = require.cache[ filename ];
			}
			return required;
		} );
	},
	handleExpression: function( expr, requesterModule ) {
		expr = this.parse( expr );
		if ( expr[ 0 ] === ":" ) {
			return this.route( expr );
		} else if ( expr[ 0 ] === "#" ) {
			var filename = ( this._module ? this._module.filename : this._directory ) + expr;
			if ( !Module._cache[ filename ] ) {
				var module = Module._cache[ filename ] = new Module( filename, this._module || requesterModule );
				module.filename = filename;
				module.exports = this.value( expr.substr( 1 ) );
				module.loaded = true;
			}
			return filename;
		} else {
			return Module._resolveFilename( expr, requesterModule );
		}
	},
	parse: function( expr, directory ) {
		var self = this;
		expr = expr == null ? expr : parse( expr + "", function( _, path ) {
			return self.value( path );
		} );
		var tmp = rHere.exec( expr );
		if ( tmp ) {
			expr = path.resolve( tmp[ 0 ] === "@/" ? directory || this._directory : process.cwd(), expr.substr( 2 ) );
		}
		return expr;
	},
	route: function( expr, requester ) {
		if ( !requester ) {
			requester = this;
		}
		if ( this._routes && this._routes[ expr ] ) {
			return Module._resolveFilename( requester.parse( this._routes[ expr ], this._directory ), this._module );
		}
		if ( this._parent ) {
			return this._parent.route( expr, requester );
		}
		throw new Error( "Unknown route '" + expr + "'" );
	},
	rawValue: function( path ) {
		if ( !path ) {
			return this._data;
		}
		path = path.split( "." );
		var data = this._data;
		while ( data != null && path.length ) {
			data = data[ path.shift() ];
		}
		return data;
	},
	value: function( path ) {
		var self = this;
		return _.cloneDeep( this.rawValue( path ), function( value ) {
			if ( typeof value === "string" ) {
				return self.parse( value );
			}
		} );
	}
};

module.exports = Config;
