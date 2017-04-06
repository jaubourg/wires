"use strict";

const addRaw = require( `./addRaw` );
const clone = require( `../util/clone` );
const getDirectives = require( `./getDirectives` );
const getFiles = require( `./getFiles` );
const hereDir = require( `./hereDir` );
const importParent = require( `./importParent` );
const parse = require( `../util/recursiveReplace` )( /\{([#?])([^{}]+)\}/g );
const path = require( `path` );

const cwd = process.cwd();

const rDir = /\/$/;
const rHere = /^(\.\.?|[>~])\/(.*)$/;

class Config {

    constructor( directory, getParent ) {
        const files = getFiles( directory );
        const directives = getDirectives( files );
        if ( directives.has( `@namespace` ) ) {
            this._namespace = directives.get( `@namespace` );
        }
        if ( directory === cwd ) {
            addRaw( this, directory, Config.commandLineOverride );
        }
        addRaw( this, directory, files.get( `env` ) );
        addRaw( this, directory, files.get( `main` ) );
        if ( getParent && !directives.get( `@root` ) ) {
            importParent( this, getParent() );
        }
        addRaw( this, directory, files.get( `envDefaults` ) );
        addRaw( this, directory, files.get( `defaults` ) );
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
        return clone( data, value => ( ( typeof value === `string` ) ? this.parse( value ) : value ) );
    }

    dirRoute( expr ) {
        const array = expr.split( `/` );
        const length = array.length;
        let found;
        let current = this._dirRoutes;
        for ( let index = 0; index < length; ) {
            current = current.get( array[ index ] );
            if ( current ) {
                index++;
                const tmp = current.get( `/` );
                if ( tmp ) {
                    found = {
                        "directory": tmp.directory,
                        index,
                        "value": tmp.value,
                    };
                }
            } else {
                break;
            }
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
        const route =
            ( this._routes && this._routes[ expr ] ) ||
            ( this._dirRoutes && this.dirRoute( expr ) );
        if ( !route ) {
            throw new Error( `Unknown route '${ expr }'` );
        }
        return this.parseRoute( route.value, route.directory );
    }

    value( expr ) {
        if ( !expr ) {
            return this.parseData( this._data );
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
        return this.parseData( data );
    }
}

module.exports = Config;
