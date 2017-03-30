"use strict";

const addRaw = require( `./addRaw` );
const clone = require( `../util/clone` );
const createModule = require( `../util/createModule` );
const getFiles = require( `./getFiles` );
const hereDir = require( `./hereDir` );
const importParent = require( `./importParent` );
const parse = require( `../util/recursiveReplace` )( /\{([#?])([^{}]+)\}/g );
const path = require( `path` );

const cwd = process.cwd();

const rDir = /\/$/;
const rHere = /^(\.\.?|[>~])\/(.*)$/;
const rPath = /\//;

class Config {

    constructor( directory, parent ) {
        this._directory = directory;
        const files = getFiles( directory );
        if ( files.has( `namespace` ) ) {
            this._namespace = String( files.get( `namespace` ) );
        }
        if ( this._directory === cwd ) {
            addRaw( this, Config.commandLineOverride );
        }
        addRaw( this, files.get( `env` ) );
        addRaw( this, files.get( `main` ) );
        importParent( this, parent );
        addRaw( this, files.get( `envDefaults` ) );
        addRaw( this, files.get( `defaults` ) );
    }

    handleExpression( expr, requester, resolveFilename ) {
        let parsed = this.parse( expr, this._directory, true );
        if ( ( parsed[ 0 ] === `#` ) || ( parsed[ 0 ] === `?` ) ) {
            // eslint-disable-next-line no-nested-ternary
            const filename = ( parsed[ 1 ] === `>` ? `` : this._directory ) + parsed;
            if ( !require.cache[ filename ] ) {
                createModule( filename, instance => {
                    const value = this.value( parsed.substr( 1 ) );
                    // eslint-disable-next-line no-param-reassign
                    instance.exports = ( value == null ) && ( parsed[ 0 ] === `?` ) ? `` : value;
                } );
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
            const isDir = rDir.test( parsed );
            parsed = path.resolve(
                hereDir.get( test[ 1 ] ) || ( test[ 1 ].length === 1 ? directory : path.dirname( directory ) ),
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
        for ( let index = 0; ( index < length ) && current; index++ ) {
            if ( current.has( `/` ) ) {
                const tmp = current.get( `/` );
                found = {
                    "directory": tmp.directory,
                    index,
                    "value": tmp.value,
                };
            }
            current = current.get( array[ index ] );
        }
        return found && {
            "directory": found.directory,
            "value": found.value + array.slice( found.index ).join( `/` ),
        };
    }

    route( expr ) {
        const route = this._routes && this._routes[ expr ];
        if ( route ) {
            return this.parse( route.value, route.directory, true );
        }
        const dirRoute = this._dirRoutes && rPath.test( expr ) && this.dirRoute( expr );
        if ( dirRoute ) {
            return this.parse( dirRoute.value, dirRoute.directory, true );
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
        const length = array.length;
        let data = this._data;
        for ( let index = 0; ( data != null ) && ( index < length ); index++ ) {
            const key = array[ index ];
            data = data.hasOwnProperty( key ) ? data[ key ] : undefined;
        }
        return data;
    }

    value( expr, directory ) {
        return clone(
            this.rawValue( expr ),
            value => ( ( typeof value === `string` ) ? this.parse( value, directory ) : value )
        );
    }
}

module.exports = Config;
