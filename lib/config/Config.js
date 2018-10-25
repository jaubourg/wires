"use strict";

const commandLineOverride = require( `./commandLineOverride` );
const Data = require( `./Data` );
const { dirname } = require( `path` );
const DirRoutes = require( `./DirRoutes` );
const isObject = require( `./util/isObject` );
const parse = require( `./util/recursiveReplace` )( /\{([#?])([^{}]+)\}/g );
const RawConfig = require( `./RawConfig` );
const resolve = require( `./util/resolve` );

const cwd = process.cwd();

const hereDir = new Map( [
    [ `>`, cwd ],
    [ `~`, require( `os` ).homedir() ],
] );

const rDir = /\/(\(\))?$/;
const rFallback = /\?$/;
const rHere = /^(\.\.?|[>~])\/(.*)$/;

const computedTypes = {
    "function": true,
    "string": true,
};
const routeTypes = {
    "string": true,
};

const map = new Map();

class Config {

    static cache( dir ) {
        if ( !map.has( dir ) ) {
            const parentDir = dirname( dir );
            map.set(
                dir,
                new Config( dir, parentDir && ( parentDir !== dir ) && ( () => Config.cache( parentDir ) ) )
            );
        }
        return map.get( dir );
    }

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

    // eslint-disable-next-line complexity
    _addRoute( _key, _value, directory ) {
        // eslint-disable-next-line prefer-const
        let [ isDir, isComputed ] = rDir.exec( _key ) || [];
        if ( !isComputed && ( typeof _value === `function` ) ) {
            isComputed = isDir;
        }
        const expectedTypes = isComputed ? computedTypes : routeTypes;
        if ( !expectedTypes.hasOwnProperty( typeof _value ) ) {
            throw new Error( `route ${ _key } should point to a ${
                Object.getOwnPropertyNames( expectedTypes ).join( ` or ` )
            }` );
        }
        if ( !_value ) {
            throw new Error( `route ${ _key } should point to a non-empty string` );
        }
        let key = _key;
        let value = _value;
        if ( isDir ) {
            key = _key.slice( 0, key.length - ( isDir.length - 1 ) );
            if ( isComputed ) {
                if ( typeof value === `string` ) {
                    let func;
                    let funcPath;
                    value = ( ...items ) => {
                        if ( !func ) {
                            funcPath = require.resolve( `${ this.parseRoute( _value, directory ) }` );
                            func = require( funcPath );
                            if ( typeof func !== `function` ) {
                                throw new Error( `route ${ _key } = <<${ _value }>> is not a function` );
                            }
                        }
                        return resolve( funcPath, func( ...items ) );
                    };
                } else if ( typeof value === `function` ) {
                    value = ( ...items ) => resolve( `${ directory }/_`, _value( ...items ) );
                } else {
                    throw new Error( `route ${ key } is not a function or a string` );
                }
            }
            this._dirRoutes.add( key, value, directory );
        }
        this._routes.add( key, {
            directory,
            value,
        } );
    }

    _add( content, directory ) {
        if ( !content ) {
            return;
        }
        for ( const key of Object.keys( content ) ) {
            const value = content[ key ];
            const firstLetter = key[ 0 ];
            if ( firstLetter === `:` ) {
                this._addRoute( key, value, directory );
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
        const { directory, remaining = [], value } = route;
        return this.parseRoute(
            typeof value === `function` ? value( ...remaining ) : value + remaining.join( `/` ),
            directory
        );
    }

    value( expr ) {
        if ( expr[ 0 ] === `>` ) {
            return ( expr.length > 1 ) ? process.env[ expr.substr( 1 ) ] : process.env;
        }
        const potential = this._data.getPath( expr );
        let last;
        for ( const item of potential ) {
            last = this.parseData( item );
            if ( last ) {
                break;
            }
        }
        return last;
    }
}

module.exports = Config;
