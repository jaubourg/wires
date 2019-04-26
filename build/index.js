"use strict";

const { generate } = require( `pegjs` );
const { readFileSync, writeFileSync } = require( `fs` );
const { resolve } = require( `path` );

const targetDir = resolve( __dirname, `../lib/config/parse` );
const grammar = readFileSync( resolve( targetDir, `grammar.pegjs` ), `utf8` );
const parserCode = generate( grammar, {
    "format": `commonjs`,
    "output": `source`,
} );
writeFileSync( resolve( targetDir, `index.js` ), parserCode );
