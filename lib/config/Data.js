"use strict";

const isObject = require( `./util/isObject` );

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

const getField = ( object, key, _ ) => ( object.hasOwnProperty( key ) ? object[ key ] : _ );

class Data {
    add( key, value ) {
        this._object = setFieldDefault( this._object, key, value );
    }
    addAll( data, namespace ) {
        const dataObject = data._object;
        if ( dataObject ) {
            setFieldDefault( this, `_object`, namespace ? dataObject[ namespace ] : dataObject );
        }
    }
    get( key ) {
        const object = this._object;
        return ( object !== undefined ) && object.hasOwnProperty( key ) ? object[ key ] : undefined;
    }
    getPath( path ) {
        let data = this._object;
        if ( path && ( data !== undefined ) ) {
            for ( const key of path.split( `.` ) ) {
                let next;
                if ( data !== null ) {
                    next = getField( data, key );
                    if ( !next ) {
                        next = getField( data, `${ key }?`, next );
                    }
                }
                data = next;
                if ( data === undefined ) {
                    break;
                }
            }
        }
        return data;
    }
}

module.exports = Data;
