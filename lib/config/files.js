"use strict";

const files = new Map( [
    [ `defaults`, `wires-defaults` ],
    [ `main`, `wires` ],
    [ `namespace`, `wires-namespace` ],
] );

const env = process.env.NODE_ENV;

if ( env ) {
    files.set( `env`, `wires.${ env }` );
    files.set( `envDefaults`, `wires-defaults.${ env }` );
}

module.exports = files;
