"use strict";

const Data = require( `./Data` );
const { dirname } = require( `path` );
const DirRoutes = require( `./DirRoutes` );
const { parse } = require( `../parse` );
const RawConfig = require( `./RawConfig` );
const resolve = require( `./resolve` );

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
    #data;
    #directory;
    #dirRoutes;
    #namespace;
    #routes;
    constructor( directory, getParent ) {
        this.#directory = directory;
        const rawConfig = new RawConfig( directory );
        this.#namespace = rawConfig.get( `@namespace` );
        this.#data = new Data();
        this.#dirRoutes = new DirRoutes();
        this.#routes = new Data();
        const addRoute = ( _key, _value ) => {
            const [ isDir, isComputed = ( typeof _value === `function` ) && isDir ] = rDir.exec( _key ) || [];
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
                                funcPath = require.resolve( String( this.get( _value, true, directory ).getValue() ) );
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
                this.#dirRoutes.add( key, value, directory );
            }
            this.#routes.add( key, {
                directory,
                value,
            } );
        };
        const add = type => {
            const content = rawConfig.get( type );
            if ( content ) {
                for ( const key of Object.keys( content ) ) {
                    const value = content[ key ];
                    const [ firstLetter ] = key;
                    if ( firstLetter === `:` ) {
                        addRoute( key.slice( 1 ), value );
                    } else if ( firstLetter !== `@` ) {
                        this.#data.add( key, value );
                    }
                }
            }
        };
        add( `env` );
        add( `main` );
        if ( getParent && !rawConfig.get( `@root` ) ) {
            const parent = getParent();
            this.#data.addAll( parent.#data, this.#namespace );
            this.#dirRoutes.addAll( parent.#dirRoutes );
            this.#routes.addAll( parent.#routes );
        }
        add( `envDefaults` );
        add( `defaults` );
    }
    get( expr, isPath, asCode, directory = this.#directory ) {
        return parse( expr, {
            asCode,
            "config": this,
            directory,
            isPath,
        } );
    }
    getPath( path ) {
        return this.#data.getPath( path );
    }
    getRoute( route ) {
        return this.#routes.get( route ) || this.#dirRoutes.get( route );
    }
}

module.exports = Config;
