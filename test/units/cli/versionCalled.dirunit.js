"use strict";

const binPath = require.resolve( `../../../lib/bin` );
const spawnPath = require.resolve( `../../util/spawn` );

for ( const version of [
    `0.2.0`,
    `0.3.0`,
    `0.3.1`,
    `0.4.0`,
    `0.5.0`,
    `0.5.1`,
    `1.0.0`,
    `1.1.0`,
    `1.1.1`,
] ) {
    module.exports[ `/${ version }` ] = {
        "package.json": {
            "name": `test-wires`,
            "dependencies": {
                "wires": version,
            },
        },
        "data.json": {
            "bin": binPath,
            "spawn": spawnPath,
            version,
        },
        [ `${ version }.unit.js` ]() {
            const data = require( `./data` );
            const spawn = require( data.spawn );
            const basename = require( `path` ).basename;
            class StringStream extends ( require( `stream` ).Writable ) {
                constructor() {
                    super();
                    this._string = ``;
                }
                _write( chunk, encoding, done ) {
                    this._string += chunk.toString();
                    done();
                }
                getString() {
                    return this._string;
                }
            }
            module.exports[ `command line for ${ data.version }` ] = __ => {
                __.expect( 1 );
                const output = new StringStream();
                spawn( {
                    "args": [ data.bin, `--version` ],
                    "cwd": __dirname,
                    "stdio": [ null, `pipe`, `inherit` ],
                    "onCreation": child => child.stdout.pipe( output ),
                } )
                    .then(
                        () => __.strictEqual(
                            output.getString(),
                            `v${ data.version } (${ basename( process.execPath, `.exe` ) } ${ process.version })\n`
                        ),
                        // eslint-disable-next-line no-console
                        error => console.log( error.stack )
                    )
                    .then( () => __.done() );
            };
        },
    };
}
