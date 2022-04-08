/*
copyright (c) 2014, Yahoo! Inc. All rights reserved
copyrights licensed under the New BSD License
see the accompanying LICENSE file for terms
copyright (c) 2022, Julian Aubourg All rights reserved
copyrights licensed under the MIT License
see the accompanying LICENSE file for terms
*/

'use strict';

const { deleteFunctions, escapeUnsafeChars } = require( `./utils` );
const Placeholders = require( `./Placeholders` );

// eslint-disable-next-line complexity
const serialize = ( input, options ) => {

    // eslint-disable-next-line no-param-reassign
    options = options || {};

    // backwards-compatibility for `space` as the second argument.
    if ( ( typeof options === `number` ) || ( typeof options === `string` ) ) {
        // eslint-disable-next-line no-param-reassign
        options = {
            "space": options,
        };
    }

    let placeholders;

    // eslint-disable-next-line prefer-const
    let internal;

    // returns placeholders for functions and regexps (identified by index)
    // which are later replaced by their string representation.
    // eslint-disable-next-line func-style
    const replacer = function( key, value ) {

        // for nested function
        if ( options.ignoreFunction ) {
            // eslint-disable-next-line no-param-reassign
            value = deleteFunctions( value );
        }

        return (
            placeholders || ( placeholders = new Placeholders( internal, options ) )
        // eslint-disable-next-line no-invalid-this
        ).get( this[ key ] ) || value;
    };

    internal = data => {

        // check if the parameter is function
        if ( options.ignoreFunction && ( typeof data === `function` ) ) {
            // eslint-disable-next-line no-param-reassign
            data = undefined;
        }
        // protects against `JSON.stringify()` returning `undefined`, by serializing
        // to the literal string: "undefined".
        if ( data === undefined ) {
            return `undefined`;
        }

        let str = JSON.stringify( data, options.isJSON ? null : replacer, options.space );

        // protects against `JSON.stringify()` returning `undefined`, by serializing
        // to the literal string: "undefined".
        if ( str === undefined ) {
            return `undefined`;
        }

        // replace unsafe HTML and invalid JavaScript line terminator chars with
        // their safe Unicode char counterpart. This _must_ happen before the
        // regexps and functions are serialized and added back to the string.
        if ( options.unsafe !== true ) {
            str = escapeUnsafeChars( str );
        }

        return placeholders ? placeholders.restore( str ) : str;
    };

    return internal( input );
};

module.exports = serialize;
