/* eslint-disable no-magic-numbers */
import "./index.js";

import generateModule from "./lib/generateModule.js";
import { deBypass, getConfig, isBypass, isRoute, isValue } from "./lib/loader-utils.js";
import nodeVersion from "./lib/nodeVersion.js";
import UID from "./lib/UID.js";

const marker = `file:///wires${ UID }:`;

// node 16+
export const load = ( url, context, defaultLoad ) => {
    const tmp = url.startsWith( marker ) && JSON.parse( url.slice( marker.length ) );
    if ( tmp ) {
        const [ directory, expression ] = tmp;
        return {
            "format": `module`,
            "source": generateModule( getConfig( directory ).get( expression ) ),
        };
    }
    return defaultLoad( url, context );
};

// node 12 and 14
export const getFormat = ( nodeVersion.major < 16 ) && ( ( url, context, defaultGetFormat ) => (
    url.startsWith( marker ) ? {
        "format": `module`,
    } : defaultGetFormat( url, context )
) );
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

export const resolve = ( specifier, context, defaultResolve ) => {
    if ( isBypass( specifier ) ) {
        return defaultResolve( deBypass( specifier ), context );
    }
    if ( isRoute( specifier ) ) {
        return defaultResolve( getConfig( getDirectory( context ) ).get( specifier, true ).getValue(), context );
    }
    if ( isValue( specifier ) ) {
        return {
            "url": `${ marker }${ JSON.stringify( [ getDirectory( context ), specifier ] ) }`,
        };
    }
    return defaultResolve( specifier, context );
};
