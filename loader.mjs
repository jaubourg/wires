/* eslint-disable no-magic-numbers */
import "./index.js";

import { generateModule, DEFAULT_EXPORT } from "./lib/generateModule.js";
import { deBypass, getConfig, isBypass, isRoute, isValue } from "./lib/base.js";
import nodeVersion from "./lib/nodeVersion.js";

const getItem = ( dir, expression, isPath ) => getConfig( dir ).get( expression, isPath, false );

const rDir = /^file:\/\/(.+)\/[^/]*$/;
const getDirectory = ( { parentURL } ) => {
    const tmp = rDir.exec( parentURL );
    if ( tmp ) {
        return tmp[ 1 ];
    }
    return process.cwd();
};

const getPath = ( expr, context, defaultResolve ) =>
    defaultResolve( getItem( getDirectory( context ), expr, true ).getValue() );

const wiresMarker = `file:///wires${ DEFAULT_EXPORT }:`;

// node 16+
export const load = ( url, context, defaultLoad ) => {
    const tmp = url.startsWith( wiresMarker ) && JSON.parse( url.slice( wiresMarker.length ) );
    if ( tmp ) {
        const [ directory, expression ] = tmp;
        return {
            "format": `module`,
            "source": generateModule( getItem( directory, expression ) ),
        };
    }
    return defaultLoad( url, context );
};

// node 12 and 14
export const getFormat = ( nodeVersion.major < 16 ) && ( ( url, context, defaultGetFormat ) => (
    url.startsWith( wiresMarker ) ? {
        "format": `module`,
    } : defaultGetFormat( url, context )
) );
export const getSource = ( nodeVersion.major < 16 ) && load;

export const resolve = ( specifier, context, defaultResolve ) => {
    if ( isBypass( specifier ) ) {
        return defaultResolve( deBypass( specifier ), context );
    }
    if ( isRoute( specifier ) ) {
        return getPath( specifier, context, defaultResolve );
    }
    if ( isValue( specifier ) ) {
        return {
            "url": `${ wiresMarker }${ JSON.stringify( [ getDirectory( context ), specifier ] ) }`,
        };
    }
    return defaultResolve( specifier, context );
};
