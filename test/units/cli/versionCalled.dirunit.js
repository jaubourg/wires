"use strict";

const { execSync } = require( `child_process` );

const binPath = require.resolve( `../../../bin` );

const versions = JSON.parse( execSync( `npm view wires versions --json`, {
    "env": process.env,
} ) ).filter( version => {
    const split = version.split( `.` );
    return ( Number( split[ 0 ] ) > 0 ) || ( Number( split[ 1 ] ) >= 3 );
} );

for ( const version of versions ) {
    module.exports[ `/${ version }` ] = {
        "package.json": {
            "name": `test-wires`,
            "dependencies": {
                "wires": version,
            },
        },
        "data.json": {
            "bin": binPath,
            version,
        },
        [ `${ version }.unit.js` ]() {
            const data = require( `./data` );
            const exec = require( `child_process` ).execSync;
            module.exports[ `command line for ${ data.version }` ] = __ => {
                __.expect( 1 );
                __.strictEqual(
                    exec( `node ${ data.bin } --version`, {
                        "cwd": __dirname,
                        "env": process.env,
                    } ).toString(),
                    `v${ data.version } (node ${ process.version })\n`
                );
                __.done();
            };
        },
    };
}
