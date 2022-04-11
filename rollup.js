"use strict";

require( `wires` );

const { deBypass, getConfig, isBypass, isExportable, isRoute, isValue } = require( `./lib/loader-utils` );
const { dirname } = require( `path` );
const generateModule = require( `./lib/generateModule` );
const UID = require( `./lib/UID` );

const marker = `\0~wires~${ UID }:`;

const getDirectory = path => ( path ? dirname( path ) : process.cwd() );

module.exports = () => ( {
    load( id ) {
        if ( id.startsWith( marker ) ) {
            const [ directory, expression ] = JSON.parse( id.slice( marker.length ) );
            return generateModule( getConfig( directory ).get( expression, false, true ) );
        }
        if ( isExportable( id ) ) {
            return generateModule( id );
        }
        return null;
    },
    "name": `wires`,
    resolveId( source, importer, options ) {
        if ( isBypass( source ) ) {
            return this.resolve( deBypass( source ), importer, {
                ...options,
                "skipSelf": true,
            } );
        }
        if ( isRoute( source ) ) {
            return this.resolve( getConfig( getDirectory( importer ) ).get( source, true ).getValue(), importer, {
                ...options,
                "skipSelf": true,
            } );
        }
        if ( isValue( source ) ) {
            return `${ marker }${ JSON.stringify( [ getDirectory( importer ), source ] ) }`;
        }
        return null;
    },
} );
