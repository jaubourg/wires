import array from "#array";
import object from "#object";
import route from ":route";
import value from "#value";
import wiresEnv from "?>WIRES_ENV";

const ARRAY = [ 1, 2, process.env.WIRES_ENV, 4 ];
const OBJECT = {
    "a": 1,
    "b": 2,
    "c": process.env.WIRES_ENV,
    "d": 4,
};
const ROUTE = `route`;
const VALUE = `value`;
const VALUE_FALLBACK = `value fallback`;

// wires.json

JSON.stringify( {
    "array": [ 1, 2, `{?>WIRES_ENV}`, 4 ],
    "object": {
        "a": 1,
        "b": 2,
        "c": `{?>WIRES_ENV}`,
        "d": 4,
    },
    "value": VALUE,
    "value?": VALUE_FALLBACK,
    ":route": `./sub/route.mjs`,
} );

// noFallback.unit.mjs

import directRoute1 from "::./sub/route.mjs";

export const noFallback = __ => {
    __.plan( 6 );
    __.strictEqual( directRoute1, ROUTE, `bypass` );
    __.strictEqual( route, ROUTE, `route` );
    __.strictEqual( value, VALUE, `value` );
    __.strictEqual( wiresEnv, process.env.WIRES_ENV, `env var` );
    __.deepEqual( array, ARRAY, `array` );
    __.deepEqual( object, OBJECT, `object` );
};

// sub/wires.json

JSON.stringify( {
    "value": null,
} );

// sub/route.mjs

export default ROUTE;

// sub/fallback.unit.mjs

import directRoute2 from "::./route.mjs";

export const fallback = __ => {
    __.plan( 6 );
    __.strictEqual( directRoute2, ROUTE, `bypass` );
    __.strictEqual( route, ROUTE, `route` );
    __.strictEqual( value, VALUE_FALLBACK, `value fallback` );
    __.strictEqual( wiresEnv, process.env.WIRES_ENV, `env var` );
    __.deepEqual( array, ARRAY, `array` );
    __.deepEqual( object, OBJECT, `object` );
};
