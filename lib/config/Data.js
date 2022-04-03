"use strict";

const isObject = require( `../isObject` );

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

const getField = ( object, key, array ) => {
    if ( object.hasOwnProperty( key ) ) {
        const value = object[ key ];
        if ( value !== undefined ) {
            array.push( value );
        }
    }
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
        return ( object !== undefined ) && object.hasOwnProperty( key ) ? object[ key ] : undefined;
    }
    getPath( path ) {
        let data = this._object === undefined ? [] : [ this._object ];
        if ( path ) {
            for ( const key of path.split( `.` ) ) {
                const next = [];
                for ( const item of data ) {
                    if ( item !== null ) {
                        getField( item, key, next );
                        getField( item, `${ key }?`, next );
                    }
                }
                data = next;
                if ( !data.length ) {
                    break;
                }
            }
        }
        return data;
    }
}

module.exports = Data;
