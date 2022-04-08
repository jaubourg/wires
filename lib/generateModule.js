"use strict";

const { resolve } = require( `path` );
const { readFileSync } = require( `fs` );

const rIdentifier = /^[\p{L}\p{Nl}$_][\p{L}\p{Nl}$\p{Mn}\p{Mc}\p{Nd}\p{Pc}]*$/;
const rJS = /\.js$/;

const exportables = new Map();

const FROM = ` from ${ JSON.stringify( resolve( __dirname, `exportable/funcs.mjs` ) ) };`;

const generateFuncsImport = identifier => `import ${ identifier }${ FROM }`;
const isIdentifier = rIdentifier.test.bind( rIdentifier );

const generateIdentifiers = ( set, number ) => {
    let candidate = ``;
    const selected = [];
    while ( selected.length < number ) {
        candidate += `$`;
        if ( !set.has( candidate ) ) {
            selected.push( candidate );
        }
    }
    return selected;
};

module.exports = item => {
    if ( typeof item === `string` ) {
        // eslint-disable-next-line no-param-reassign
        item = item.replace( rJS, `.mjs` );
        let source = exportables.get( item );
        if ( source === undefined ) {
            exportables.set( item, ( source = readFileSync( item, `utf8` ) ) );
        }
        return source;
    }
    let keys = item.getKeys();
    if ( keys && keys.length ) {
        keys = keys.filter( isIdentifier );
        if ( keys.length ) {
            // eslint-disable-next-line no-magic-numbers
            const [ funcsIdentifier, objectIdentifier ] = generateIdentifiers( new Set( keys ), 2 );
            return (
                `${
                    generateFuncsImport( funcsIdentifier )
                }const ${
                    objectIdentifier
                }=${
                    item.getCode( funcsIdentifier )
                };export default ${
                    objectIdentifier
                };export const{${
                    keys.join( `,` )
                }}=${
                    objectIdentifier
                };`
            );
        }
    }
    return `${ item.isCode() ? generateFuncsImport( `$` ) : `` }export default ${ item.getCode( `$` ) };`;
};
