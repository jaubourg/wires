"use strict";

const { generate } = require( `peggy` );
const { readFileSync, writeFileSync } = require( `fs` );
const { resolve } = require( `path` );

const targetDir = resolve( __dirname, `../lib/config/parse` );
const grammar = readFileSync( resolve( targetDir, `grammar.peggy` ), `utf8` );
writeFileSync( resolve( targetDir, `index.js` ), generate( grammar, {
    "format": `commonjs`,
    "output": `source`,
} ) );
