"use strict";

const path = require( `path` );
const { spawn } = require( `child_process` );

const binPath = path.resolve( `${ process.env.WIRES_DIR }/bin.js` );
const unitPath = path.resolve( __dirname, `../util/runUnits.js` );

const commonArgs = [ `--experimental-import-meta-resolve` ];

const wiresArgs = [
    `--require=${ path.resolve( `${ process.env.WIRES_DIR }/index.js` ) }`,
    `--loader=${ path.resolve( `${ process.env.WIRES_DIR }/loader.mjs` ) }`,
];

module.exports = ( type, { bin, bundle, wiresEnv = `test` } = {} ) => () => new Promise( ( resolve, reject ) => {
    console.log(
        `running tests for ${ type } (${
            bin ? `` : `no `
        }binary, ${
            bin === false ? `no ` : ``
        }wires, ENV=${
            wiresEnv || `-`
        })\n`
    );
    const bundleMode = `--bundle=${
        // eslint-disable-next-line no-nested-ternary
        bundle ?
            ( bundle === `only` ? `only` : `yes` ) :
            ( bundle === false ? `no` : `yes` )
    }`;
    spawn(
        process.execPath,
        // eslint-disable-next-line no-nested-ternary
        bin ?
            [ binPath, ...commonArgs, unitPath, type, bundleMode ] :
            (
                ( bin === false ) ?
                    [ ...commonArgs, unitPath, type, bundleMode ] :
                    [ ...wiresArgs, ...commonArgs, unitPath, type, bundleMode ] ),
        {
            "env": {
                ...process.env,
                "WIRES_ENV": wiresEnv,
            },
            "stdio": `inherit`,
        }
    )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} );
