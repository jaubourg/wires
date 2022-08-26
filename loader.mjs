/* eslint-disable no-magic-numbers */
import "./index.js";

import generateModule from "./lib/generateModule.js";
import { deBypass, getConfig, isBypass, isRoute, isValue } from "./lib/loader-utils.js";
import nodeVersion from "./lib/nodeVersion.js";
import { fileURLToPath, pathToFileURL } from "url";

const rWires = /^(file:\/\/.+)\?wires=(.+)$/;

// node 16+
export const load = ( url, context, nextLoad ) => {
    const tmp = rWires.exec( url );
    if ( tmp ) {
        const [ , dir, expr ] = tmp;
        return {
            "format": `module`,
            "shortCircuit": true,
            "source": generateModule( getConfig( fileURLToPath( dir ) ).get( decodeURIComponent( expr ) ) ),
        };
    }
    return nextLoad( url, context );
};

// node 12 and 14
/* istanbul ignore next */
export const getFormat = ( nodeVersion.major < 16 ) && ( ( url, context, defaultGetFormat ) => (
    rWires.test( url ) ? {
        "format": `module`,
    } : defaultGetFormat( url, context )
) );
/* istanbul ignore next */
export const getSource = ( nodeVersion.major < 16 ) && load;

// all versions

const rDir = /^file:\/\/(.+)\/[^/]*$/;
const getDirectory = ( { parentURL } ) => {
    if ( parentURL ) {
        const tmp = rDir.exec( parentURL );
        if ( tmp ) {
            return tmp[ 1 ];
        }
    }
    return process.cwd();
};

export const resolve = ( specifier, context, nextResolve ) => {
    // in case it was already resolved
    if ( rWires.test( specifier ) ) {
        return {
            "shortCircuit": true,
            "url": specifier,
        };
    }
    if ( isBypass( specifier ) ) {
        return nextResolve( deBypass( specifier ), context );
    }
    if ( isRoute( specifier ) ) {
        return nextResolve( getConfig( getDirectory( context ) ).get( specifier, true ).getValue(), context );
    }
    if ( isValue( specifier ) ) {
        return {
            "shortCircuit": true,
            "url": `${ pathToFileURL( getDirectory( context ) ) }?wires=${ encodeURIComponent( specifier ) }`,
        };
    }
    return nextResolve( specifier, context );
};
