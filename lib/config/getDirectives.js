/* eslint-disable no-labels */

"use strict";

const handlers = new Map( [
    [ `@namespace`, value => {
        const type = typeof value;
        if ( type !== `string` ) {
            throw new Error( `namespace should be a string, ${ type } provided.` );
        }
        const trimmed = value.trim();
        if ( !trimmed ) {
            throw new Error( `namespace cannot be an empty string.` );
        }
        return trimmed;
    } ],
    [ `@root`, value => {
        const type = typeof value;
        if ( type !== `boolean` ) {
            throw new Error( `root should be a boolean, ${ type } provided.` );
        }
        return value;
    } ],
] );

const names = Array.from( handlers.keys() );

const fileTypesInOrder = [ `env`, `main`, `envDefaults`, `defaults` ];

module.exports = files => {
    const directives = new Map();
    mainloop:
    for ( const fileType of fileTypesInOrder ) {
        const data = files.get( fileType );
        if ( data ) {
            for ( const name of names ) {
                if ( data.hasOwnProperty( name ) && !directives.has( name ) ) {
                    directives.set( name, handlers.get( name )( data[ name ] ) );
                    // eslint-disable-next-line max-depth
                    if ( directives.size === handlers.size ) {
                        break mainloop;
                    }
                }
            }
        }
    }
    return directives;
};
