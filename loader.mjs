/* eslint-disable no-magic-numbers */
import "./index.js";

import generateModule from "./lib/generateModule.js";
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

const cache = new Map();

// node 16+
export const load = ( url, context, defaultLoad ) => {
    const data = cache.get( url );
    if ( data ) {
        return {
            "format": `module`,
            "source": generateModule( getItem( data.dir, data.specifier ) ),
        };
    }
    return defaultLoad( url, context );
};

// node 12 and 14
export const getFormat = ( nodeVersion.major < 16 ) && ( ( url, context, defaultGetFormat ) => (
    cache.has( url ) ? {
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
        const dir = getDirectory( context );
        const url = `file://${ dir }/wires:${ specifier }`;
        if ( !cache.has( url ) ) {
            cache.set( url, {
                dir,
                specifier,
            } );
        }
        return {
            url,
        };
    }
    return defaultResolve( specifier, context );
};
