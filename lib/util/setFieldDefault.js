"use strict";

const isObject = require( `./isObject` );

const setFieldDefault = ( object, key, value ) => {
    const target = object || {};
    if ( !target.hasOwnProperty( key ) ) {
        target[ key ] = value;
    } else if ( isObject( value ) && isObject( target[ key ] ) ) {
        const subTarget = target[ key ];
        for ( const subKey of Object.keys( value ) ) {
            setFieldDefault( subTarget, subKey, value[ subKey ] );
        }
    }
    return target;
};

module.exports = setFieldDefault;
