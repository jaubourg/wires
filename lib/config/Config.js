"use strict";

var override = require( "./commandLineOverride" )( process.argv );
process.argv = override.argv;
override = override.data;

var _ = require( "lodash" );
var merge = require( "../util/merge" );
var Module = require( "module" );
var parse = require( "../util/recursiveReplace" )( /\{([#?])([^{}]+)\}/g );
var path = require( "path" );
var requireIfExists = require( "../util/requireIfExists" );

var cwd = process.cwd();

var hereDir = {
	">": cwd,
	"~": require( "../util/home" ) || cwd
};

var rDirRoute = /\/$/;
var rHere = /^(\.\.?|[>~])\/(.*)$/;
var rPath = /\//;

function setField( object, key, value ) {
	if ( !object ) {
		object = {};
	}
	object[ key ] = value;
	return object;
}

function Config( directory, parent ) {
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
	this._compileDirRoutes();
}

Config.prototype = {
	_add: function( raw ) {
		if ( raw ) {
			var data;
			var routes;
			var dirRoutes;
			_.forOwn( raw, function( value, key ) {
				if ( key[ 0 ] === ":" ) {
					if ( typeof( value ) !== "string" ) {
						throw "route " + key + " should point to a string";
					}
					if ( !value ) {
						throw "route " + key + " should point to a non-empty string";
					}
					if ( rDirRoute.test( key ) ) {
						key = key.slice( 0, -1 );
						dirRoutes = setField( dirRoutes, key, value );
					}
					routes = setField( routes, key, value );
				} else {
					data = setField( data, key, value );
				}
			} );
			if ( dirRoutes ) {
				this._dirRoutes = this._dirRoutes ? _.defaults( this._dirRoutes, dirRoutes ) : dirRoutes;
			}
			if ( routes ) {
				this._routes = this._routes ? _.defaults( this._routes, routes ) : routes;
			}
			if ( data ) {
				this._data = this._data ? merge( data, this._data ) : data;
			}
		}
		return this;
	},
	_compileDirRoutes: function() {
		if ( this._dirRoutes ) {
			var compiled = {};
			_.forOwn( this._dirRoutes, function( value, key ) {
				key = key.split( "/" );
				var last = key.length - 1;
				var i = 0;
				var object = compiled;
				for ( ; i < last; i++ ) {
					object = object[ key[ i ] ] || ( object[ key[ i ] ] = {} );
				}
				object[ key[ last ] ] = {
					"/": value
				};
			} );
			this._dirRoutes = compiled;
		}
	},
	_importParent: function() {
		if ( this._parent ) {
			this._data = merge( {}, this._parent.rawValue( this._namespace ), this._data );
		}
		return this;
	},
	_getFiles: function() {
		var self = this;
		var directory = "::" + this._directory + path.sep;
		return _.mapValues( {
			namespace: "-namespace",
			main: "",
			env: process.env.NODE_ENV ? ( "." + process.env.NODE_ENV ) : undefined,
			defaults: "-defaults",
			envDefaults: process.env.NODE_ENV ? ( "-defaults." + process.env.NODE_ENV ) : undefined
		}, function( filename, type ) {
			if ( filename == null ) {
				return;
			}
			filename = directory + "wires" + filename;
			var resolvedFilename;
			var required;
			for ( var extension in require.extensions ) {
				if ( !require.extensions.hasOwnProperty( extension ) ) {
					continue;
				}
				resolvedFilename = filename + extension;
				required = requireIfExists( resolvedFilename );
				if ( required ) {
					if ( type === "namespace" ) {
						self._namespace = required + "";
					}
					if ( !self._module ) {
						self._module = require.cache[ resolvedFilename ];
					}
					return required;
				}
			}
		} );
	},
	handleExpression: function( expr, requester, resolveFilename ) {
		expr = this.parse( expr, this._directory, true );
		if ( expr[ 0 ] === "#" || expr[ 0 ] === "?" ) {
			var filename = ( expr[ 1 ] === ">" ? "" : ( this._module ? this._module.filename : this._directory ) ) + expr;
			if ( !Module._cache[ filename ] ) {
				var module = Module._cache[ filename ] = new Module( filename, this._module || requester );
				module.filename = filename;
				module.exports = this.value( expr.substr( 1 ) );
				if ( !module.exports && ( expr[ 0 ] === "?" ) ) {
					module.exports = "";
				}
				module.loaded = true;
			}
			return filename;
		}
		if ( expr[ 0 ] === ":" ) {
			expr = this.route( expr );
		}
		return resolveFilename( expr, requester );
	},
	parse: function( expr, directory, isRoute ) {
		var self = this;
		var tmp;
		expr = expr == null ? expr : parse( expr + "", function( _, modifier, path ) {
			var value = self.value( path, directory );
			if ( !value && modifier === "?" ) {
				value = "";
			}
			return value;
		} );
		if ( isRoute && ( tmp = rHere.exec( expr ) ) ) {
			expr = path.resolve(
				hereDir.hasOwnProperty( tmp[ 1 ] ) && hereDir[ tmp[ 1 ] ] ||
					( tmp[ 1 ].length === 1 ? directory : path.dirname( directory ) ),
				tmp[ 2 ]
			);
		}
		return expr;
	},
	dirRoute: function( expr ) {
		expr = expr.split( "/" );
		var found;
		var current = this._dirRoutes;
		var length = expr.length;
		var i = 0;
		for ( ; i < length && current; i++ ) {
			if ( current[ "/" ] ) {
				found = {
					i: i,
					value: current[ "/" ]
				};
			}
			current = current[ expr[ i ] ];
		}
		if ( found ) {
			return found.value + expr.slice( found.i ).join( "/" );
		}
	},
	route: function( expr, requester ) {
		var value;
		if ( !requester ) {
			requester = this;
		}
		if ( this._routes && this._routes[ expr ] ) {
			return requester.parse( this._routes[ expr ], this._directory, true );
		}
		if ( this._dirRoutes && rPath.test( expr ) && ( value = this.dirRoute( expr ) ) ) {
			return requester.parse( value, this._directory, true );
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
			return ( expr.length > 1 ) ? process.env[ expr.substr( 1 ) ] : process.env;
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
