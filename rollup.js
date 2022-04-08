"use strict";

const { deBypass, getConfig, isBypass, isExportable, isRoute, isValue } = require( `./lib/loader-utils` );
const { dirname } = require( `path` );
const generateModule = require( `./lib/generateModule` );
const UID = require( `./lib/UID` );

const marker = `\0${ UID }:`;

const getDirectory = path => ( path ? dirname( path ) : process.cwd() );

module.exports = () => ( {
    "load": id => {
        if ( id.startsWith( marker ) ) {
            const [ directory, expression ] = JSON.parse( id.slice( marker.length ) );
            return generateModule( getConfig( directory ).get( expression, false, true ) );
        }
        const exportable = isExportable( id );
        if ( exportable ) {
            return generateModule( id );
        }
        return null;
    },
    "name": `wires`,
    resolveId( source, importer ) {
        if ( isBypass( source ) ) {
            return deBypass( source );
        }
        if ( isRoute( source ) ) {
            return getConfig( getDirectory( importer ) ).get( source, true ).getValue();
        }
        if ( isValue( source ) ) {
            return `${ marker }${ JSON.stringify( [ getDirectory( importer ), source ] ) }`;
        }
        return null;
    },
} );
