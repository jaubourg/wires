/* eslint-disable no-continue */

"use strict";

const env = process.env.WIRES_ENV;

const files = env ? [
    [ `env`, `wires.${ env }` ],
    [ `main`, `wires` ],
    [ `envDefaults`, `wires-defaults.${ env }` ],
    [ `defaults`, `wires-defaults` ],
] : [
    [ `main`, `wires` ],
    [ `defaults`, `wires-defaults` ],
];

const directiveHandlers = [
    [
        `@namespace`,
        value => {
            const type = typeof value;
            if ( type !== `string` ) {
                throw new Error( `namespace should be a string, ${ type } provided.` );
            }
            const trimmed = value.trim();
            if ( !trimmed ) {
                throw new Error( `namespace cannot be an empty string.` );
            }
            return trimmed;
        },
    ],
    [
        `@root`,
        value => {
            const type = typeof value;
            if ( type !== `boolean` ) {
                throw new Error( `root should be a boolean, ${ type } provided.` );
            }
            return value;
        },
    ],
];

class RawConfig extends Map {
    constructor( directory ) {
        super();
        const dir = `:::${ directory }/`;
        let directives = directiveHandlers.length;
        for ( const fileEntry of files ) {
            const [ type, basename ] = fileEntry;
            let data;
            try {
                data = require( dir + basename );
            } catch ( e ) {
                if ( e.code !== `MODULE_NOT_FOUND` ) {
                    throw e;
                }
                continue;
            }
            if ( !( data instanceof Object ) ) {
                continue;
            }
            this.set( type, data );
            if ( !directives ) {
                continue;
            }
            for ( const [ name, handler ] of directiveHandlers ) {
                if ( !this.has( name ) && data.hasOwnProperty( name ) ) {
                    this.set( name, handler( data[ name ] ) );
                    if ( !( --directives ) ) {
                        break;
                    }
                }
            }
        }
    }
}

module.exports = RawConfig;
