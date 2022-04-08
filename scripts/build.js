"use strict";

const { generate } = require( `peggy` );
const { readdirSync, readFileSync, writeFileSync } = require( `fs` );
const { resolve } = require( `path` );

// exportables

{
    const rJS = /\.js$/;
    const targetDir = resolve( __dirname, `../lib/exportable` );

    readdirSync( targetDir ).forEach( file => {
        if ( !rJS.test( file ) ) {
            return;
        }
        writeFileSync(
            resolve( targetDir, file.replace( rJS, `.mjs` ) ),
            readFileSync( resolve( targetDir, file ), `utf8` )
                .replace( /^"use strict";\n+/g, `` )
                .replace(
                    /^const (\{ [^}]+ }) = require\( `([^`]+)` \);$/gm,
                    ( _, names, mod ) => `import ${ names } from "${ mod }";`
                )
                .replace( /^module.exports = /m, `export default ` )
        );
    } );
}

// parser

{
    const targetDir = resolve( __dirname, `../lib/parse` );

    const grammar = readFileSync( resolve( targetDir, `grammar.peggy` ), `utf8` );
    writeFileSync( resolve( targetDir, `index.js` ), generate( grammar, {
        "format": `commonjs`,
        "output": `source`,
    } ) );
}
