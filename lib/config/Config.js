"use strict";

var override = require( "./commandLineOverride" )( process.argv );
process.argv = override.argv;
override = override.data;

var _ = require( "lodash" );
var merge = require( "../util/merge" );
var Module = require( "module" );
var parse = require( "../util/recursiveReplace" )( /\{#([^{}]+)\}/g );
var path = require( "path" );
var requireIfExists = require( "../util/requireIfExists" );

var cwd;

var rHere = /[@>]\//;

function Config( directory, parent ) {
	if ( !cwd ) {
		cwd = process.cwd();
	}
	this._directory = directory;
	var rawFiles = this._getFiles();
	if ( !this._module && parent ) {
		this._module = parent._module;
	}
	this._parent = parent;
	if ( this._directory === cwd ) {
		this._add( override );
	}
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
			var data;
			var routes;
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
			env: process.env.NODE_ENV ? ( "." + process.env.NODE_ENV ) : undefined,
			defaults: "-defaults",
			envDefaults: process.env.NODE_ENV ? ( "-defaults." + process.env.NODE_ENV ) : undefined
		}, function( filename, type ) {
			if ( filename == null ) {
				return;
			}
			filename = path.resolve( self._directory, "wires" + filename );
			var resolvedFilename;
			var required;
			for ( var extension in require.extensions ) {
				if ( !require.extensions.hasOwnProperty( extension ) ) {
					continue;
				}
				resolvedFilename = filename + extension;
				required = requireIfExists( resolvedFilename );
				if ( required ) {
					if ( !self._module ) {
						self._module = require.cache[ resolvedFilename ];
					}
					if ( required.NAMESPACE ) {
						if ( type !== "main" ) {
							throw "cannot define NAMESPACE in anything but wires.json (found in " + resolvedFilename + ")";
						}
						self._namespace = required.NAMESPACE;
						delete required.NAMESPACE;
					}
					return required;
				}
			}
		} );
	},
	handleExpression: function( expr, requesterModule ) {
		expr = this.parse( expr );
		if ( expr[ 0 ] === ":" ) {
			return this.route( expr );
		} else if ( expr[ 0 ] === "#" ) {
			var filename = ( expr[ 1 ] === ">" ? "" : ( this._module ? this._module.filename : this._directory ) ) + expr;
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
			return self.value( path, directory );
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
	rawValue: function( expr ) {
		if ( !expr ) {
			return this._data;
		}
		if ( expr[ 0 ] === ">" ) {
			var key = expr.substr( 1 );
			return key ? process.env[ key ] : process.env;
		}
		expr = expr.split( "." );
		var data = this._data;
		while ( data != null && expr.length ) {
			data = data[ expr.shift() ];
		}
		return data;
	},
	value: function( expr, directory ) {
		var self = this;
		return _.cloneDeep( this.rawValue( expr ), function( value ) {
			if ( typeof value === "string" ) {
				return self.parse( value, directory );
			}
		} );
	}
};

module.exports = Config;
