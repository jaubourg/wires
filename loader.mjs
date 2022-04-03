/* eslint-disable no-magic-numbers */
import "./index.js";

import Config from "./lib/config/Config.js";
import generateModule from "./lib/generateModule.js";
import nodeVersion from "./lib/nodeVersion.js";

const getItem = ( dir, expression, isPath ) => Config.cache( dir ).get( expression, isPath, false ).value;

const rDir = /^file:\/\/(.+)\/[^/]*$/;
const getDirectory = ( { parentURL } ) => {
    const tmp = rDir.exec( parentURL );
    if ( tmp ) {
        return tmp[ 1 ];
    }
    return process.cwd();
};

const getPath = ( expr, context, defaultResolve ) =>
    defaultResolve( getItem( getDirectory( context ), expr, true ) );

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

const rRouteExpr = /^[~>]|{[#?]/;
const rValue = /^[#?]|^\s*\(\s*(?:bool(?:ean)?|num(ber)?)\s*\)/;

export const resolve = ( specifier, context, defaultResolve ) => {
    if ( specifier[ 0 ] === `:` ) {
        if ( specifier[ 1 ] === `:` ) {
            if ( specifier[ 2 ] === `:` ) {
                return defaultResolve( specifier.slice( 3 ), context );
            }
            return defaultResolve( specifier.slice( 2 ), context );
        }
        return getPath( specifier, context, defaultResolve );
    }
    if ( rRouteExpr.test( specifier ) ) {
        return getPath( specifier, context, defaultResolve );
    }
    if ( rValue.test( specifier ) ) {
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
