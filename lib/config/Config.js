"use strict";

const addRaw = require( `./addRaw` );
const clone = require( `../util/clone` );
const getFiles = require( `./getFiles` );
const hereDir = require( `./hereDir` );
const importParent = require( `./importParent` );
const parse = require( `../util/recursiveReplace` )( /\{([#?])([^{}]+)\}/g );
const path = require( `path` );
const requireSymbol = require( `../util/requireSymbol` );

const cwd = process.cwd();

const rDir = /\/$/;
const rHere = /^(\.\.?|[>~])\/(.*)$/;
const rPath = /\//;

class Config {

    constructor( directory, parent ) {
        const files = getFiles( directory );
        if ( files.has( `namespace` ) ) {
            this._namespace = String( files.get( `namespace` ) );
        }
        if ( directory === cwd ) {
            addRaw( this, directory, Config.commandLineOverride );
        }
        addRaw( this, directory, files.get( `env` ) );
        addRaw( this, directory, files.get( `main` ) );
        importParent( this, parent );
        addRaw( this, directory, files.get( `envDefaults` ) );
        addRaw( this, directory, files.get( `defaults` ) );
    }

    get( expr, mod ) {
        const parsed = this.parse( expr );
        const firstChar = parsed[ 0 ];
        if ( ( firstChar === `#` ) || ( firstChar === `?` ) ) {
            const value = this.value( parsed.substr( 1 ) );
            return ( value == null ) && ( firstChar === `?` ) ? `` : value;
        }
        return mod[ requireSymbol ]( firstChar === `:` ? this.route( parsed ) : parsed );
    }

    parse( expr ) {
        return ( expr == null ) ? expr : parse( String( expr ), ( __, modifier, subExpr ) => {
            let value = this.value( subExpr );
            if ( ( value == null ) && ( modifier === `?` ) ) {
                value = ``;
            }
            return value;
        } );
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

    parseRoute( value, directory ) {
        let parsed = this.parse( value );
        const test = rHere.exec( parsed );
        if ( test ) {
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

    route( expr ) {
        const route =
            ( this._routes && this._routes[ expr ] ) ||
            ( this._dirRoutes && rPath.test( expr ) && this.dirRoute( expr ) );
        if ( !route ) {
            throw new Error( `Unknown route '${ expr }'` );
        }
        return this.parseRoute( route.value, route.directory );
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

    value( expr ) {
        return clone(
            this.rawValue( expr ),
            value => ( ( typeof value === `string` ) ? this.parse( value ) : value )
        );
    }
}

module.exports = Config;
