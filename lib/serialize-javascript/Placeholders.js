/*
copyright (c) 2014, Yahoo! Inc. All rights reserved
copyrights licensed under the New BSD License
see the accompanying LICENSE file for terms
copyright (c) 2022, TwicPics Inc. All rights reserved
copyrights licensed under the MIT License
see the accompanying LICENSE file for terms
*/

"use strict";

const { identity, serializeFunction } = require( `./utils` );

const rCollision = /^@[ABDFILMNRSTU]\d+@$/;
const rPlaceholder = /(\\)?"@([ABDFILMNRSTU])(\d+)@"/g;

const byPrototype = new Map( [
    [ Array, v => ( ( v.filter( () => true ).length !== v.length ) && `A` ) ],
    [ Date, `D` ],
    [ Map, `M` ],
    [ RegExp, `R` ],
    [ Set, `S` ],
    [ URL, `L` ],
].map( ( [ construct, code ] ) => [ construct.prototype, code ] ) );

const byType = new Map( [
    [ `bigint`, `B` ],
    [ `function`, `F` ],
    [ `number`, v => ( isNaN( v ) ? `N` : ( !isFinite( v ) && `I` ) ) ],
    [ `string`, v => ( rCollision.test( v ) && `T` ) ],
    [ `undefined`, `U` ],
] );

class Placeholders {
    #options;
    #serialize;
    #values;
    constructor( serialize, options ) {
        this.#options = options;
        this.#serialize = serialize;
        this.#values = [];
    }
    get( v ) {
        const t = typeof v;
        let code = ( ( v && ( t === `object` ) ) ? byPrototype.get( Object.getPrototypeOf( v ) ) : byType.get( t ) );
        if ( code instanceof Function ) {
            code = code( v );
        }
        return code && `@${ code }${ this.#values.push( v ) - 1 }@`;
    }
    restore( expression ) {
        const values = this.#values;
        if ( !values.length ) {
            return expression;
        }
        const options = this.#options;
        const serialize = this.#serialize;
        const serializers = {
            "A": v => `Array.prototype.slice.call(${
                // eslint-disable-next-line prefer-object-spread
                serialize( Object.assign( {
                    "length": v.length,
                }, v ), options )
            })`,
            "B": v => `BigInt("${ v }")`,
            "D": v => `new Date("${ v.toISOString() }")`,
            "F": serializeFunction,
            "I": identity,
            "L": v => `new URL("${ v.toString() }")`,
            "M": v => `new Map(${ serialize( Array.from( v.entries() ), options ) })`,
            "N": identity,
            "R": v => `new RegExp(${ serialize( v.source ) }, "${ v.flags }")`,
            "S": v => `new Set(${ serialize( Array.from( v.values() ), options ) })`,
            "T": v => JSON.stringify( v ),
            "U": identity,
        };
        return this.#values.length ? expression.replace( rPlaceholder, ( match, backSlash, type, index ) => (
            // the placeholder may not be preceded by a backslash. This is to prevent
            // replacing things like `"a\"@__R-<UID>-0__@"` and thus outputting
            // invalid JS.
            backSlash ? match : serializers[ type ]( values[ index ] )
        ) ) : expression;
    }
}

module.exports = Placeholders;
