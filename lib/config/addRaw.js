/* eslint-disable no-param-reassign */

"use strict";

const dirRoutes = require( `./dirRoutes` );
const setFieldDefault = require( `../util/setFieldDefault` );

const rDirRoute = /\/$/;

module.exports = ( config, directory, raw ) => {
    if ( !raw ) {
        return;
    }
    for ( const key of Object.keys( raw ) ) {
        const value = raw[ key ];
        if ( key[ 0 ] === `:` ) {
            if ( typeof value !== `string` ) {
                throw new Error( `route ${ key } should point to a string` );
            }
            if ( !value ) {
                throw new Error( `route ${ key } should point to a non-empty string` );
            }
            if ( rDirRoute.test( key ) ) {
                config._dirRoutes = dirRoutes.add( config._dirRoutes, directory, key, value );
            }
            config._routes = setFieldDefault( config._routes, key, {
                directory,
                value,
            } );
        } else {
            config._data = setFieldDefault( config._data, key, value );
        }
    }
};
