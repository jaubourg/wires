"use strict";

const commandLineOverride = require( `./commandLineOverride` );
const Data = require( `./Data` );
const dirname = require( `path` ).dirname;
const DirRoutes = require( `./DirRoutes` );
const isObject = require( `./util/isObject` );
const parse = require( `./util/recursiveReplace` )( /\{([#?])([^{}]+)\}/g );
const RawConfig = require( `./RawConfig` );

const cwd = process.cwd();

const hereDir = new Map( [
    [ `>`, cwd ],
    [ `~`, require( `os` ).homedir() ],
] );

const rDir = /\/$/;
const rFallback = /\?$/;
const rHere = /^(\.\.?|[>~])\/(.*)$/;

class Config {

    constructor( directory, getParent ) {
        const rawConfig = new RawConfig( directory );
        this._namespace = rawConfig.get( `@namespace` );
        this._data = new Data();
        this._dirRoutes = new DirRoutes();
        this._routes = new Data();
        if ( directory === cwd ) {
            this._add( commandLineOverride.data, directory );
        }
        this._add( rawConfig.get( `env` ), directory );
        this._add( rawConfig.get( `main` ), directory );
        if ( getParent && !rawConfig.get( `@root` ) ) {
            this._addParent( getParent() );
        }
        this._add( rawConfig.get( `envDefaults` ), directory );
        this._add( rawConfig.get( `defaults` ), directory );
    }

    _add( content, directory ) {
        if ( !content ) {
            return;
        }
        for ( const key of Object.keys( content ) ) {
            const value = content[ key ];
            const firstLetter = key[ 0 ];
            if ( firstLetter === `:` ) {
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
                const fallbacks = [];
                for ( const key of Object.keys( data ) ) {
                    if ( rFallback.test( key ) ) {
                        fallbacks.push( key );
                    } else {
                        output[ key ] = this.parseData( data[ key ] );
                    }
                }
                for ( const key of fallbacks ) {
                    const realKey = key.slice( 0, -1 );
                    if ( !output.hasOwnProperty( realKey ) || !output[ realKey ] ) {
                        output[ realKey ] = this.parseData( data[ key ] );
                    }
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
                ( directory && ( test[ 1 ].length === 1 ? directory : dirname( directory ) ) ) ||
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
        if ( expr[ 0 ] === `>` ) {
            return ( expr.length > 1 ) ? process.env[ expr.substr( 1 ) ] : process.env;
        }
        return this.parseData( this._data.getPath( expr ) );
    }
}

module.exports = Config;
