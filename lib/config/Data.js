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
        return ( object != null ) && object.hasOwnProperty( key ) ? object[ key ] : undefined;
    }
    getAll() {
        return this._object;
    }
    getPath( path ) {
        const array = path.split( `.` );
        const length = array.length;
        let data = this._object;
        for ( let index = 0; ( data != null ) && ( index < length ); index++ ) {
            const key = array[ index ];
            let next;
            if ( data.hasOwnProperty( key ) ) {
                next = data[ key ];
            }
            if ( !next ) {
                const fallbackKey = `${ key }?`;
                if ( data.hasOwnProperty( fallbackKey ) ) {
                    next = data[ fallbackKey ];
                }
            }
            data = next;
        }
        return data;
    }
}

module.exports = Data;
