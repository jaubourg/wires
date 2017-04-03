"use strict";

const sep = require( `path` ).sep;

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

module.exports = directory => {
    const output = new Map();
    files.forEach( ( basename, type ) => {
        try {
            output.set( type, require( directory + sep + basename ) );
            return;
        } catch ( e ) {
            if ( e.code !== `MODULE_NOT_FOUND` ) {
                throw e;
            }
        }
    } );
    return output;
};
