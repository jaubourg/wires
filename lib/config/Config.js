"use strict";

const commandLineOverride = require( `./commandLineOverride` );
const Data = require( `./Data` );
const { dirname } = require( `path` );
const DirRoutes = require( `./DirRoutes` );
const { parse } = require( `./parse` );
const RawConfig = require( `./RawConfig` );
const resolve = require( `./util/resolve` );

const cwd = process.cwd();

const rDir = /\/(\(\))?$/;

const computedTypes = new Set( [ `function`, `string` ] );
const routeTypes = new Set( [ `string` ] );

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
        this._directory = directory;
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
        if ( _value !== null ) {
            const expectedTypes = isComputed ? computedTypes : routeTypes;
            if ( !expectedTypes.has( typeof _value ) ) {
                throw new Error( `route ${ _key } should point to a ${
                    Object.getOwnPropertyNames( expectedTypes ).join( ` or ` )
                }` );
            }
            if ( !_value ) {
                throw new Error( `route ${ _key } should point to a non-empty string` );
            }
        }
        let key = _key;
        let value = _value;
        if ( isDir ) {
            key = _key.slice( 0, key.length - ( isDir.length - 1 ) );
            if ( isComputed ) {
                if ( value === null ) {
                    throw new Error( `route ${ key } is not a function or a string` );
                } else if ( typeof value === `string` ) {
                    let func;
                    let funcPath;
                    value = ( ...items ) => {
                        if ( !func ) {
                            funcPath = require.resolve( String( this.get( _value, true, directory ).value ) );
                            func = require( funcPath );
                            if ( typeof func !== `function` ) {
                                throw new Error( `route ${ _key } is not a function` );
                            }
                        }
                        return resolve( funcPath, func( ...items ) );
                    };
                } else {
                    value = ( ...items ) => resolve( `${ directory }/_`, _value( ...items ) );
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
            const [ firstLetter ] = key;
            if ( firstLetter === `:` ) {
                this._addRoute( key.slice( 1 ), value, directory );
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

    get( expr, isPath, asCode, directory = this._directory ) {
        return parse( expr, {
            asCode,
            "config": this,
            directory,
            isPath,
        } );
    }
}

module.exports = Config;
