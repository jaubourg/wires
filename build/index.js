"use strict";

const { generate } = require( `pegjs` );
const { readFileSync, writeFileSync } = require( `fs` );
const { resolve } = require( `path` );

const targetDir = resolve( __dirname, `../lib/config/parse` );

writeFileSync(
    resolve( targetDir, `index.js` ),
    generate(
        readFileSync( resolve( targetDir, `grammar.pegjs` ), `utf8` ),
        {
            "format": `commonjs`,
            "output": `source`,
        }
    )
);
