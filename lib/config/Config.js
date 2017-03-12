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
    "~": require( "../util/home" ) || cwd,
};

var rDirRoute = /\/$/;
var rHere = /^(\.\.?|[>~])\/(.*)$/;
var rPath = /\//;

function setField( object, key, value ) {
    var target = object || {};
    target[ key ] = value;
    return target;
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
    "_add": function( raw ) {
        var data;
        var routes;
        var dirRoutes;
        if ( raw ) {
            _.forOwn( raw, function( value, key ) {
                if ( key[ 0 ] === ":" ) {
                    if ( typeof value !== "string" ) {
                        throw new Error( "route " + key + " should point to a string" );
                    }
                    if ( !value ) {
                        throw new Error( "route " + key + " should point to a non-empty string" );
                    }
                    if ( rDirRoute.test( key ) ) {
                        // eslint-disable-next-line no-param-reassign
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
    "_compileDirRoutes": function() {
        var compiled;
        if ( this._dirRoutes ) {
            compiled = {};
            _.forOwn( this._dirRoutes, function( value, key ) {
                var array = key.split( "/" );
                var last = array.length - 1;
                var i = 0;
                var object = compiled;
                for ( ; i < last; i++ ) {
                    object = object[ array[ i ] ] || ( object[ array[ i ] ] = {} );
                }
                object[ array[ last ] ] = {
                    "/": value,
                };
            } );
            this._dirRoutes = compiled;
        }
    },
    "_importParent": function() {
        if ( this._parent ) {
            this._data = merge( {}, this._parent.rawValue( this._namespace ), this._data );
        }
        return this;
    },
    "_getFiles": function() {
        var self = this;
        var directory = "::" + this._directory + path.sep;
        return _.mapValues( {
            "namespace": "-namespace",
            "main": "",
            "env": process.env.NODE_ENV ? ( "." + process.env.NODE_ENV ) : undefined,
            "defaults": "-defaults",
            "envDefaults": process.env.NODE_ENV ? ( "-defaults." + process.env.NODE_ENV ) : undefined,
        }, function( basename, type ) {
            if ( basename == null ) {
                return undefined;
            }
            var filename = directory + "wires" + basename;
            var resolvedFilename;
            var required;
            var extension;
            for ( extension in require.extensions ) {
                if ( require.extensions.hasOwnProperty( extension ) ) {
                    resolvedFilename = filename + extension;
                    required = requireIfExists( resolvedFilename );
                    if ( required ) {
                        if ( type === "namespace" ) {
                            self._namespace = String( required );
                        }
                        if ( !self._module ) {
                            self._module = require.cache[ resolvedFilename ];
                        }
                        return required;
                    }
                }
            }
            return undefined;
        } );
    },
    "handleExpression": function( expr, requester, resolveFilename ) {
        var filename;
        var moduleObject;
        var parsed = this.parse( expr, this._directory, true );
        if ( ( parsed[ 0 ] === "#" ) || ( parsed[ 0 ] === "?" ) ) {
            // eslint-disable-next-line no-nested-ternary
            filename = ( parsed[ 1 ] === ">" ? "" :
                ( this._module ? this._module.filename : this._directory ) ) + parsed;
            if ( !Module._cache[ filename ] ) {
                moduleObject = new Module( filename, this._module || requester );
                Module._cache[ filename ] = moduleObject;
                moduleObject.filename = filename;
                moduleObject.exports = this.value( parsed.substr( 1 ) );
                if ( !moduleObject.exports && ( parsed[ 0 ] === "?" ) ) {
                    moduleObject.exports = "";
                }
                moduleObject.loaded = true;
            }
            return filename;
        }
        if ( parsed[ 0 ] === ":" ) {
            parsed = this.route( parsed );
        }
        return resolveFilename( parsed, requester );
    },
    "parse": function( expr, directory, isRoute ) {
        var isDir;
        var self = this;
        var tmp;
        var parsed = expr == null ? expr : parse( String( expr ), function( __, modifier, subExpr ) {
            var value = self.value( subExpr, directory );
            if ( !value && ( modifier === "?" ) ) {
                value = "";
            }
            return value;
        } );
        if ( isRoute && ( tmp = rHere.exec( parsed ) ) ) {
            isDir = rDirRoute.test( parsed );
            parsed = path.resolve(
                ( hereDir.hasOwnProperty( tmp[ 1 ] ) && hereDir[ tmp[ 1 ] ] ) ||
                ( tmp[ 1 ].length === 1 ? directory : path.dirname( directory ) ),
                tmp[ 2 ]
            );
            if ( isDir ) {
                parsed += "/";
            }
        }
        return parsed;
    },
    "dirRoute": function( expr ) {
        var array = expr.split( "/" );
        var found;
        var current = this._dirRoutes;
        var length = array.length;
        var i;
        for ( i = 0; ( i < length ) && current; i++ ) {
            if ( current[ "/" ] ) {
                found = {
                    "i": i,
                    "value": current[ "/" ],
                };
            }
            current = current[ array[ i ] ];
        }
        return found && ( found.value + array.slice( found.i ).join( "/" ) );
    },
    "route": function( expr, requester ) {
        var value;
        if ( !requester ) {
            // eslint-disable-next-line consistent-this, no-param-reassign
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
    "rawValue": function( expr ) {
        if ( !expr ) {
            return this._data;
        }
        if ( expr[ 0 ] === ">" ) {
            return ( expr.length > 1 ) ? process.env[ expr.substr( 1 ) ] : process.env;
        }
        var array = expr.split( "." );
        var data = this._data;
        while ( ( data != null ) && array.length ) {
            data = data[ array.shift() ];
        }
        return data;
    },
    "value": function( expr, directory ) {
        var self = this;
        return _.cloneDeepWith( this.rawValue( expr ), function( value ) {
            return ( typeof value === "string" ) ? self.parse( value, directory ) : undefined;
        } );
    },
};

module.exports = Config;
