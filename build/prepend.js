/* eslint-disable no-unused-vars */
"use strict";

// eslint-disable-next-line object-curly-newline
const {
    castBoolean,
    castNumber,
    castString,
    empty,
    getEnv,
    inCWD,
    inDir,
    inHome,
    inParentDir,
    isCode,
    join,
    needsFallback,
// eslint-disable-next-line object-curly-newline
} = require( `./util` );
const isObject = require( `../util/isObject` );
const nullModulePath = require.resolve( `../util/null` );

const output = ( type, value ) => ( {
    type,
    value,
} );

const rFallback = /\?$/;
const parseFactory = ( _options, directory ) => {
    const options = directory ? Object.assign( {}, _options, {
        directory,
    } ) : _options;
    const parse = data => {
        if ( data ) {
            if ( typeof data === `string` ) {
                // eslint-disable-next-line no-undef
                return peg$parse( data, options ).value;
            }
            if ( Array.isArray( data ) ) {
                return data.map( parse );
            }
            if ( isObject( data ) ) {
                const object = {};
                const fallbacks = [];
                for ( const key of Object.keys( data ) ) {
                    if ( rFallback.test( key ) ) {
                        fallbacks.push( key );
                    } else {
                        object[ key ] = parse( data[ key ] );
                    }
                }
                for ( const key of fallbacks ) {
                    const realKey = key.slice( 0, -1 );
                    if ( !object.hasOwnProperty( realKey ) || needsFallback( object[ realKey ] ) ) {
                        object[ realKey ] = parse( data[ key ] );
                    }
                }
                return object;
            }
        }
        return data;
    };
    return parse;
};
