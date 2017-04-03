"use strict";

const isObject = require( `./isObject` );

const clone = ( value, filter ) => {
    if ( isObject( value ) ) {
        const target = {};
        for ( const key of Object.keys( value ) ) {
            target[ key ] = clone( value[ key ], filter );
        }
        return target;
    }
    if ( Array.isArray( value ) ) {
        return value.map( filter );
    }
    return filter( value );
};

module.exports = clone;
