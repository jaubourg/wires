"use strict";

const createModule = require( `../util/createModule` );
const exists = require( `fs` ).existsSync;
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
    const extensions = Object.keys( require.extensions );
    files.forEach( ( basename, type ) => {
        const filename = directory + sep + basename;
        for ( const extension of extensions ) {
            const resolvedFilename = filename + extension;
            const moduleObject =
                require.cache[ resolvedFilename ] ||
                (
                    exists( resolvedFilename ) &&
                    createModule(
                        resolvedFilename,
                        instance => require.extensions[ extension ]( instance, resolvedFilename )
                    )
                );
            if ( moduleObject ) {
                output.set( type, moduleObject.exports );
                break;
            }
        }
    } );
    return output;
};
