"use strict";

const { exec } = require( `child_process` );

const SUPPORTS_REGISTER = Boolean( require( `module` ).register );

const bins = {
    "node": [ true, true ],
    "node --require=./index.js": [ false, true ],
    "node ./bin.js": [ false, true ],
};

const code = {
    "./lib/exportable/null.js": [ true, false ],
    "../test/units/fixture/warning.js": [ true, true ],
};

const loader = {
    "": [ false, true ],
    [ SUPPORTS_REGISTER ? `--import=./lib/registerLoader.mjs` : `--loader=./loader.mjs` ]: [ !SUPPORTS_REGISTER, true ],
};

const warnings = {
    "--no-warnings": [ false, false ],
    "": [ true, true ],
};

const cwd = process.env.WIRES_DIR;
const commands = {
    ...( [ bins, loader, warnings, code ].reduce( ( o1, o2 ) => {
        const object = {};
        for ( const [ part1, flags1 ] of Object.entries( o1 ) ) {
            for ( const [ part2, flags2 ] of Object.entries( o2 ) ) {
                object[ `${ part1 }${ part2 ? ` ${ part2 }` : `` }` ] = flags1.map( ( f, i ) => f && flags2[ i ] );
            }
        }
        return object;
    }, {
        "": [ true, true ],
    } ) ),
    "node --loader=./loader.mjs ../test/units/fixture/wiresAndWarning.js": [ true, true ],
};

const regexps = [
    /\bExperimentalWarning\b/,
    /\bWarning: lol\b/,
];

const run = command => new Promise( done => exec( command, {
    cwd,
}, ( error, stdout, stderr ) => done( {
    error,
    stderr,
    stdout,
} ) ) );

module.exports = Object.fromEntries( Object.entries( commands ).map( ( [ command, flags ] ) => [
    command,
    async __ => {
        __.plan( 2 + regexps.length );
        const { error, stderr, stdout } = await run( command );
        __.doesNotThrow( () => {
            if ( error ) {
                throw error;
            }
        }, `no error` );
        __.strictEqual( stdout, ``, `no stdout output` );
        for ( let i = 0; i < regexps.length; ++i ) {
            __.strictEqual(
                regexps[ i ].test( stderr ),
                flags[ i ],
                `warning #${ i } ${ flags[ i ] ? `present` : `absent` }`
            );
        }
    },
] ) );
