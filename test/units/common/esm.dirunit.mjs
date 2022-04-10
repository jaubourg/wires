import route from ":route";
import value from "#value";
import wiresEnv from "?>WIRES_ENV";

const ROUTE = `route`;
const VALUE = `value`;
const VALUE_FALLBACK = `value fallback`;

// wires.json

JSON.stringify( {
    "value": VALUE,
    "value?": VALUE_FALLBACK,
    ":route": `./sub/route.mjs`,
} );

// noFallback.unit.mjs

export const noFallback = __ => {
    __.plan( 3 );
    __.strictEqual( route, ROUTE );
    __.strictEqual( value, VALUE );
    __.strictEqual( wiresEnv, process.env.WIRES_ENV );
};

// sub/wires.json

JSON.stringify( {
    "value": null,
} );

// sub/route.mjs

export default ROUTE;

// sub/fallback.unit.mjs

export const fallback = __ => {
    __.plan( 3 );
    __.strictEqual( route, ROUTE );
    __.strictEqual( value, VALUE_FALLBACK );
    __.strictEqual( wiresEnv, process.env.WIRES_ENV );
};
