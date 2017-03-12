"use strict";

const override = ( () => {
    const returned = require( `./commandLineOverride` )( process.argv );
    process.argv = returned.argv;
    return returned.data;
} )();

const _ = require( `lodash` );
const merge = require( `../util/merge` );
const Module = require( `module` );
const parse = require( `../util/recursiveReplace` )( /\{([#?])([^{}]+)\}/g );
const path = require( `path` );
const requireIfExists = require( `../util/requireIfExists` );

const cwd = process.cwd();

const hereDir = {
    ">": cwd,
    "~":
        require( `os` )
            .homedir()
            .replace( /\\/g, `/` ),
};

const rDirRoute = /\/$/;
const rHere = /^(\.\.?|[>~])\/(.*)$/;
const rPath = /\//;

function setField( object, key, value ) {
    const target = object || {};
    target[ key ] = value;
    return target;
}

class Config {

    constructor( directory, parent ) {
        this._directory = directory;
        const rawFiles = this._getFiles();
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

    _add( raw ) {
        let data;
        let routes;
        let dirRoutes;
        if ( raw ) {
            _.forOwn( raw, ( value, key ) => {
                if ( key[ 0 ] === `:` ) {
                    if ( typeof value !== `string` ) {
                        throw new Error( `route ${ key } should point to a string` );
                    }
                    if ( !value ) {
                        throw new Error( `route ${ key } should point to a non-empty string` );
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
    }

    _compileDirRoutes() {
        if ( this._dirRoutes ) {
            const compiled = {};
            _.forOwn( this._dirRoutes, ( value, key ) => {
                const array = key.split( `/` );
                const last = array.length - 1;
                let object = compiled;
                for ( let i = 0; i < last; i++ ) {
                    object = object[ array[ i ] ] || ( object[ array[ i ] ] = {} );
                }
                object[ array[ last ] ] = {
                    "/": value,
                };
            } );
            this._dirRoutes = compiled;
        }
    }

    _importParent() {
        if ( this._parent ) {
            this._data = merge( this._parent.rawValue( this._namespace ), this._data );
        }
        return this;
    }

    _getFiles() {
        const directory = `::${ this._directory }${ path.sep }`;
        return _.mapValues( {
            "namespace": `-namespace`,
            "main": ``,
            "env": process.env.NODE_ENV ? ( `.${ process.env.NODE_ENV }` ) : undefined,
            "defaults": `-defaults`,
            "envDefaults": process.env.NODE_ENV ? ( `-defaults.${ process.env.NODE_ENV }` ) : undefined,
        }, ( basename, type ) => {
            if ( basename == null ) {
                return undefined;
            }
            const filename = `${ directory }wires${ basename }`;
            for ( let extension in require.extensions ) {
                if ( require.extensions.hasOwnProperty( extension ) ) {
                    const resolvedFilename = filename + extension;
                    const required = requireIfExists( resolvedFilename );
                    if ( required ) {
                        if ( type === `namespace` ) {
                            this._namespace = String( required );
                        }
                        if ( !this._module ) {
                            this._module = require.cache[ resolvedFilename ];
                        }
                        return required;
                    }
                }
            }
            return undefined;
        } );
    }

    handleExpression( expr, requester, resolveFilename ) {
        let parsed = this.parse( expr, this._directory, true );
        if ( ( parsed[ 0 ] === `#` ) || ( parsed[ 0 ] === `?` ) ) {
            // eslint-disable-next-line no-nested-ternary
            const filename = ( parsed[ 1 ] === `>` ? `` :
                ( this._module ? this._module.filename : this._directory ) ) + parsed;
            if ( !Module._cache[ filename ] ) {
                const moduleObject = new Module( filename, this._module || requester );
                Module._cache[ filename ] = moduleObject;
                moduleObject.filename = filename;
                moduleObject.exports = this.value( parsed.substr( 1 ) );
                if ( ( moduleObject.exports == null ) && ( parsed[ 0 ] === `?` ) ) {
                    moduleObject.exports = ``;
                }
                moduleObject.loaded = true;
            }
            return filename;
        }
        if ( parsed[ 0 ] === `:` ) {
            parsed = this.route( parsed );
        }
        return resolveFilename( parsed, requester );
    }

    parse( expr, directory, isRoute ) {
        let parsed = expr == null ? expr : parse( String( expr ), ( __, modifier, subExpr ) => {
            let value = this.value( subExpr, directory );
            if ( ( value == null ) && ( modifier === `?` ) ) {
                value = ``;
            }
            return value;
        } );
        let test;
        if ( isRoute && ( test = rHere.exec( parsed ) ) ) {
            const isDir = rDirRoute.test( parsed );
            parsed = path.resolve(
                ( hereDir.hasOwnProperty( test[ 1 ] ) && hereDir[ test[ 1 ] ] ) ||
                ( test[ 1 ].length === 1 ? directory : path.dirname( directory ) ),
                test[ 2 ]
            );
            if ( isDir ) {
                parsed += `/`;
            }
        }
        return parsed;
    }

    dirRoute( expr ) {
        const array = expr.split( `/` );
        const length = array.length;
        let found;
        let current = this._dirRoutes;
        for ( let i = 0; ( i < length ) && current; i++ ) {
            if ( current[ `/` ] ) {
                found = {
                    i,
                    "value": current[ `/` ],
                };
            }
            current = current[ array[ i ] ];
        }
        return found && ( found.value + array.slice( found.i ).join( `/` ) );
    }

    route( expr, requester ) {
        let value;
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
        throw new Error( `Unknown route '${ expr }'` );
    }

    rawValue( expr ) {
        if ( !expr ) {
            return this._data;
        }
        if ( expr[ 0 ] === `>` ) {
            return ( expr.length > 1 ) ? process.env[ expr.substr( 1 ) ] : process.env;
        }
        const array = expr.split( `.` );
        let data = this._data;
        while ( ( data != null ) && array.length ) {
            data = data[ array.shift() ];
        }
        return data;
    }

    value( expr, directory ) {
        return _.cloneDeepWith(
            this.rawValue( expr ),
            value => ( ( typeof value === `string` ) ? this.parse( value, directory ) : undefined )
        );
    }
}

module.exports = Config;
