"use strict";

var _ = require( "lodash" );
var merge = require( "../util/merge" );
var Module = require( "module" );
var parse = require( "../util/recursiveReplace" )( /\{#([^{}]+)\}/g );
var path = require( "path" );

function Config( directory, module, parent, rawFiles ) {
	this._directory = directory;
	this._module = module || parent && parent._module;
	this._parent = parent;
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
			this._data = merge( {}, this._parent._data, this._data );
		}
		return this;
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
	parse: function( expr ) {
		var self = this;
		return expr == null ? expr : parse( expr + "", function( _, path ) {
			return self.value( path );
		} );
	},
	route: function( expr, requester ) {
		if ( !requester ) {
			requester = this;
		}
		if ( this._routes && this._routes[ expr ] ) {
			return Module._resolveFilename( requester.parse( this._routes[ expr ] ), this._module );
		}
		if ( this._parent ) {
			return this._parent.route( expr, requester );
		}
		throw new Error( "Unknown route '" + expr + "'" );
	},
	value: function( path ) {
		path = path.split( "." );
		var data = this._data;
		while ( data != null && path.length ) {
			data = data[ path.shift() ];
		}
		var self = this;
		return _.cloneDeep( data, function( value ) {
			if ( typeof value === "string" ) {
				return self.parse( value );
			}
		} );
	}
};

module.exports = Config;
