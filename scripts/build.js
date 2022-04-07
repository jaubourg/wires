"use strict";

const { generate } = require( `peggy` );
const { readFileSync, writeFileSync } = require( `fs` );
const { resolve } = require( `path` );

const targetDir = resolve( __dirname, `../lib/config/parse` );

// funcs

writeFileSync(
    resolve( targetDir, `funcs.mjs` ),
    readFileSync( resolve( targetDir, `funcs.js` ), `utf8` )
        .replace( /^"use strict";\n+/g, `` )
        .replace(
            /^const (\{ [^}]+ }) = require\( `([^`]+)` \);$/gm,
            ( _, names, mod ) => `import ${ names } from "${ mod }";`
        )
        .replace( /^module.exports = /m, `export default ` )
);

// parser

const grammar = readFileSync( resolve( targetDir, `grammar.peggy` ), `utf8` );
writeFileSync( resolve( targetDir, `index.js` ), generate( grammar, {
    "format": `commonjs`,
    "output": `source`,
} ) );
