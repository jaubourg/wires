"use strict";

const env = process.env.NODE_ENV;

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
];

class RawConfig extends Map {
    constructor( directory ) {
        super();
        // eslint-disable-next-line no-param-reassign
        directory += `/`;
        this._directives = new Map();
        for ( const fileEntry of files ) {
            const type = fileEntry[ 0 ];
            const basename = fileEntry[ 1 ];
            let data;
            try {
                data = require( directory + basename );
            } catch ( e ) {
                if ( e.code !== `MODULE_NOT_FOUND` ) {
                    throw e;
                }
                // eslint-disable-next-line no-continue
                continue;
            }
            this.set( type, data );
            if ( this._directives.size === directiveHandlers.length ) {
                return;
            }
            for ( const directiveHandlerEntry of directiveHandlers ) {
                const name = directiveHandlerEntry[ 0 ];
                if ( !this._directives.has( name ) && data.hasOwnProperty( name ) ) {
                    this._directives.set( name, directiveHandlerEntry[ 1 ]( data[ name ] ) );
                    // eslint-disable-next-line max-depth
                    if ( this._directives.size === directiveHandlers.length ) {
                        break;
                    }
                }
            }
        }
    }
    getDirective( key ) {
        return this._directives.get( key );
    }
}

module.exports = RawConfig;
