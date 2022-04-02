/* eslint-disable no-magic-numbers */
import "./index.js";

import Config from "./config/Config.js";

const rDir = /^file:\/\/(.+)\/[^/]*$/;
const getDirectory = contextOrDirectory => {
    if ( typeof contextOrDirectory === `string` ) {
        return contextOrDirectory;
    }
    const tmp = rDir.exec( contextOrDirectory.parentURL );
    if ( tmp ) {
        return tmp[ 1 ];
    }
    return process.cwd();
};

const stringify = value => {
    let expression;
    try {
        expression = JSON.stringify( value );
    } catch ( _ ) {}
    return expression || `undefined`;
};

const get = ( expr, context, defaultResolve ) => {
    const { value } = Config.cache( getDirectory( context ) ).get( expr, Boolean( defaultResolve ), false );
    return defaultResolve ? defaultResolve( value, context ) : {
        "format": `module`,
        "source": `export default(${ stringify( value ) });`,
    };
};

const cache = new Map();

// node 16+
export const load = ( url, context, defaultLoad ) => {
    const data = cache.get( url );
    if ( data ) {
        return get( data.specifier, data.dir );
    }
    return defaultLoad( url, context );
};

// node 12+
const pre16 = ( process.version < `v16` );
export const getFormat = pre16 && ( ( url, context, defaultGetFormat ) => (
    cache.has( url ) ? {
        "format": `module`,
    } : defaultGetFormat( url, context )
) );
export const getSource = pre16 && load;

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
        return get( specifier, context, defaultResolve );
    }
    if ( rRouteExpr.test( specifier ) ) {
        return get( specifier, context, defaultResolve );
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
