"use strict";

const { generate } = require( `peggy` );
const { readFileSync, writeFileSync } = require( `fs` );
const { resolve } = require( `path` );

const targetDir = resolve( __dirname, `../lib/config/parse` );

// funcs

let funcs = readFileSync( resolve( targetDir, `funcs.js` ), `utf8` );

let exportNames;

funcs = funcs.replace( /^"use strict";\n+|\nmodule\.exports = \{([^}]+)\};\s+$/g, ( _, exportPart ) => {
    if ( exportPart ) {
        exportNames = new Set( exportPart.replace( /\s+/g, `` ).split( `,` ).slice( 0, -1 ) );
    }
    return ``;
} );

funcs = funcs.replace( /^const (\S+) =/gm, ( full, name ) => ( exportNames.has( name ) ? `export ${ full }` : full ) );

funcs = funcs.replace(
    /^const (\{ [^}]+ }) = require\( `([^`]+)` \);$/gm,
    ( _, names, mod ) => `import ${ names } from "${ mod }";`
);

writeFileSync( resolve( targetDir, `funcs.mjs` ), funcs );

// parser

const grammar = readFileSync( resolve( targetDir, `grammar.peggy` ), `utf8` );
writeFileSync( resolve( targetDir, `index.js` ), generate( grammar, {
    "format": `commonjs`,
    "output": `source`,
} ) );
