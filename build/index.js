"use strict";

const { generate } = require( `pegjs` );
const { readFileSync, writeFileSync } = require( `fs` );
const { resolve } = require( `path` );

const rComments = /[ \t]*\/\/[^\n]*\n|[ \t]*\/\*[^\n]*\n/g;

const targetDir = resolve( __dirname, `../lib/config/parse` );
const grammar = readFileSync( resolve( targetDir, `grammar.pegjs` ), `utf8` );
const parserCode = generate( grammar, {
    "format": `commonjs`,
    "output": `source`,
} );
const finalCode = parserCode.replace(
    /\n"use strict";\n/,
    readFileSync( resolve( __dirname, `prepend.js` ), `utf8` ).replace( rComments, `` )
);
writeFileSync( resolve( targetDir, `index.js` ), finalCode );
