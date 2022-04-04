/*
copyright (c) 2014, Yahoo! Inc. All rights reserved
copyrights licensed under the New BSD License
see the accompanying LICENSE file for terms
copyright (c) 2022, TwicPics Inc. All rights reserved
copyrights licensed under the MIT License
see the accompanying LICENSE file for terms
*/

"use strict";

const isObject = require( `../isObject` );

const rArrowFunction = /.*?=>.*?/;
const rNative = /\{\s*\[native code\]\s*\}/g;
const rPureFunction = /function.*?\(/;
const rUnsafeChars = /[<>/\u2028\u2029]/g;

// mapping of unsafe HTML and invalid JavaScript line terminator chars to their
// unicode char counterparts which are safe to use in JavaScript strings.
const ESCAPED_CHARS = {
    "<": `\\u003C`,
    ">": `\\u003E`,
    "/": `\\u002F`,
    "\u2028": `\\u2028`,
    "\u2029": `\\u2029`,
};

const RESERVED_SYMBOLS = [ `*`, `async` ];

const deleteFunctions = object => (
    isObject( object ) ?
        Object.fromEntries( Object.entries( object ).filter( ( [ , value ] ) => ( typeof value !== `function` ) ) ) :
        object
);

const escapeUnsafeChars = str => str.replace( rUnsafeChars, unsafeChar => ESCAPED_CHARS[ unsafeChar ] );

const identity = x => x;

const serializeFunction = fn => {
    const serializedFn = fn.toString();
    if ( rNative.test( serializedFn ) ) {
        throw new TypeError( `Serializing native function: { fn.name }` );
    }

    // pure functions, example: {key: function() {}}
    if ( rPureFunction.test( serializedFn ) ) {
        return serializedFn;
    }

    // arrow functions, example: arg1 => arg1+5
    if ( rArrowFunction.test( serializedFn ) ) {
        return serializedFn;
    }

    const argsStartsAt = serializedFn.indexOf( `(` );
    const def = serializedFn.substr( 0, argsStartsAt )
        .trim()
        .split( ` ` )
        .filter( val => ( val.length > 0 ) );

    const nonReservedSymbols = def.filter( val => RESERVED_SYMBOLS.indexOf( val ) === -1 );

    // enhanced literal objects, example: {key() {}}
    if ( nonReservedSymbols.length > 0 ) {
        return `${ def.indexOf( `async` ) > -1 ? `async ` : `` }function${
            def.join( `` ).indexOf( `*` ) > -1 ? `*` : ``
        }${
            serializedFn.substr( argsStartsAt )
        }`;
    }

    // arrow functions
    return serializedFn;
};

module.exports = {
    deleteFunctions,
    escapeUnsafeChars,
    identity,
    serializeFunction,
};
