"use strict";

const Data = require( `./Data` );
const DirRoutes = require( `./DirRoutes` );
const getDirectives = require( `./getDirectives` );
const getFiles = require( `./getFiles` );
const hereDir = require( `./hereDir` );
const isObject = require( `../util/isObject` );
const parse = require( `../util/recursiveReplace` )( /\{([#?])([^{}]+)\}/g );
const path = require( `path` );

const cwd = process.cwd();

const rDir = /\/$/;
const rHere = /^(\.\.?|[>~])\/(.*)$/;

class Config {

    constructor( directory, getParent ) {
        this._data = new Data();
        this._dirRoutes = new DirRoutes();
        this._routes = new Data();
        const files = getFiles( directory );
        const directives = getDirectives( files );
        if ( directives.has( `@namespace` ) ) {
            this._namespace = directives.get( `@namespace` );
        }
        if ( directory === cwd ) {
            this._addFile( Config.commandLineOverride, directory );
        }
        this._addFile( files.get( `env` ), directory );
        this._addFile( files.get( `main` ), directory );
        if ( getParent && !directives.get( `@root` ) ) {
            this._addParent( getParent() );
        }
        this._addFile( files.get( `envDefaults` ), directory );
        this._addFile( files.get( `defaults` ), directory );
    }

    _addFile( content, directory ) {
        if ( !content ) {
            return;
        }
        for ( const key of Object.keys( content ) ) {
            const value = content[ key ];
            const firstLetter = key[ 0 ];
            if ( firstLetter[ 0 ] === `:` ) {
                if ( typeof value !== `string` ) {
                    throw new Error( `route ${ key } should point to a string` );
                }
                if ( !value ) {
                    throw new Error( `route ${ key } should point to a non-empty string` );
                }
                if ( rDir.test( key ) ) {
                    this._dirRoutes.add( key, value, directory );
                }
                this._routes.add( key, {
                    directory,
                    value,
                } );
            } else if ( firstLetter !== `@` ) {
                this._data.add( key, value );
            }
        }
    }

    _addParent( parent ) {
        this._data.addAll( parent._data, this._namespace );
        this._dirRoutes.addAll( parent._dirRoutes );
        this._routes.addAll( parent._routes );
    }

    getValue( expr ) {
        const value = this.value( this.parse( expr ).substr( 1 ) );
        return ( value == null ) && ( expr[ 0 ] === `?` ) ? `` : value;
    }

    parse( expr ) {
        return parse( expr, ( __, modifier, subExpr ) => {
            let value = this.value( subExpr );
            if ( ( value == null ) && ( modifier === `?` ) ) {
                value = ``;
            }
            return value;
        } );
    }

    parseData( data ) {
        if ( data ) {
            if ( typeof data === `string` ) {
                return this.parse( data );
            }
            if ( Array.isArray( data ) ) {
                return data.map( Config.prototype.parseData.bind( this ) );
            }
            if ( isObject( data ) ) {
                const output = {};
                for ( const key of Object.keys( data ) ) {
                    output[ key ] = this.parseData( data[ key ] );
                }
                return output;
            }
        }
        return data;
    }

    parseRoute( value, directory ) {
        let parsed = this.parse( value );
        const test = rHere.exec( parsed );
        if ( test ) {
            const isDir = rDir.test( parsed );
            parsed = `${
                hereDir.get( test[ 1 ] ) ||
                ( directory && ( test[ 1 ].length === 1 ? directory : path.dirname( directory ) ) ) ||
                test[ 1 ]
            }/${ test[ 2 ] }`;
            if ( isDir ) {
                parsed += `/`;
            }
        }
        return parsed;
    }

    getRoute( expr ) {
        const route = this._routes.get( expr ) || this._dirRoutes.get( expr );
        if ( !route ) {
            throw new Error( `Unknown route '${ expr }'` );
        }
        return this.parseRoute( route.value, route.directory );
    }

    value( expr ) {
        if ( !expr ) {
            return this.parseData( this._data.getAll() );
        }
        if ( expr[ 0 ] === `>` ) {
            return ( expr.length > 1 ) ? process.env[ expr.substr( 1 ) ] : process.env;
        }
        return this.parseData( this._data.getPath( expr ) );
    }
}

module.exports = Config;
