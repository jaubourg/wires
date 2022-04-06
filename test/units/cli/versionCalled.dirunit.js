"use strict";

const { execSync } = require( `child_process` );
const { "version": currentVersion } = require( `${ process.env.WIRES_DIR }/package.json` );

const root = process.env.WIRES_DIR;
const binPath = require.resolve( `${ root }/bin` );

const versions = JSON.parse( execSync( `npm view wires versions --json`, {
    "env": process.env,
} ) )
    .flatMap( version => {
        const [ major, minor ] = version.split( `.` ).slice( 0, 2 ).map( x => Number( x ) );
        return ( ( major > 0 ) || ( minor >= 3 ) ) ? [ [ version, ( major > 0 ) || ( minor >= 4 ) ] ] : [];
    } );

for ( const [ version, callsCurrent ] of versions ) {
    module.exports[ `/${ version }` ] = {
        "package.json": {
            "name": `test-wires`,
            "dependencies": {
                "wires": version,
            },
        },
        "data.json": {
            "bin": binPath,
            root,
            version,
        },
        [ `${ version }.unit.js` ]() {
            const data = require( `./data` );
            const { "execSync": exec } = require( `child_process` );
            module.exports = {
                [ `current calls ${ data.version }` ]( __ ) {
                    const expected = `v${ data.version } (node ${ process.version })`;
                    __.plan( 1 );
                    __.strictEqual(
                        exec( `node ${ data.bin } --version`, {
                            "cwd": __dirname,
                            "env": process.env,
                        } ).toString(),
                        `${ expected }\n`,
                        expected
                    );
                    __.end();
                },
            };
        },
    };
    if ( callsCurrent ) {
        module.exports[ `/${ version }` ][ `/current` ] = {
            "package.json": {
                "name": `test-wires`,
                "dependencies": {
                    "wires": `file:${ root }`,
                },
            },
            "data.json": {
                currentVersion,
                version,
            },
            "current.unit.js"() {
                const data = require( `./data` );
                const { "execSync": exec } = require( `child_process` );
                const versionBin = `${
                    __dirname
                }/../node_modules/.bin/wires${
                    process.platform === `win32` ? `.cmd` : ``
                }`;
                module.exports = {
                    [ `${ data.version } calls current` ]( __ ) {
                        const expected = `v${ data.currentVersion } (node ${ process.version })`;
                        __.plan( 1 );
                        __.strictEqual(
                            exec( `${ versionBin } --version`, {
                                "cwd": __dirname,
                                "env": process.env,
                            } ).toString(),
                            `${ expected }\n`,
                            expected
                        );
                        __.end();
                    },
                };
            },
        };
    }
}
