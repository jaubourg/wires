/* eslint-disable no-console */

"use strict";

const esmDir = require( `./esmDir` );
const { exec } = require( `child_process` );
const fs = require( `fs` );
const path = require( `path` );
const run = require( `./run` );

const rCleanFunction = /^.*\r?\n|\r?\n.*$/g;
const rJSON = /\.json$/;
const rUnit = /^(.+)\.(dir)?unit\.(c|m)?js$/;

const fixtureDir = path.resolve( __dirname, `../fixture` );
const jsonFile = path.resolve( fixtureDir, `.${ process.argv[ 2 ] }.json` );

const units = ( () => {
    try {
        return require( jsonFile );
    } catch ( e ) {
        return [];
    }
} )();

if ( units.length ) {

    run( units );

} else {

    const files = new Set( process.argv.slice( 3 ) );
    const unitDir = path.resolve( __dirname, `../units/${ process.argv[ 2 ] }` );

    const dirUnits = [];
    const npmInstall = [];

    for ( const basename of fs.readdirSync( unitDir ) ) {
        if ( !files.size || files.has( basename ) ) {
            const tmp = rUnit.exec( basename );
            if ( tmp ) {
                const filename = path.join( unitDir, basename );
                const [ , name, isDir, type = `c` ] = tmp;
                if ( isDir ) {
                    dirUnits.push( {
                        name,
                        "tree": ( type === `m` ) ? esmDir( filename ) : require( filename ),
                        type,
                    } );
                } else {
                    units.push( {
                        filename,
                        "label": name,
                        type,
                    } );
                }
            }
        }
    }

    if ( dirUnits.length ) {
        try {
            fs.mkdirSync( fixtureDir );
        } catch ( e ) {}
        const generateTree = ( dir, tree, type ) => {
            fs.mkdirSync( dir );
            if ( tree ) {
                for ( const key of Object.keys( tree ) ) {
                    let val = tree[ key ];
                    let filename;
                    if ( key[ 0 ] === `/` ) {
                        generateTree( path.join( dir, key.slice( 1 ) ), val, type );
                    } else {
                        if ( key === `package.json` ) {
                            npmInstall.push( dir );
                        }
                        filename = path.join( dir, key );
                        if ( typeof val === `function` ) {
                            val = String( val ).replace( rCleanFunction, `` );
                            if ( type === `c` ) {
                                val = `"use strict";\n${ val }`;
                            }
                        } else if ( rJSON.test( filename ) ) {
                            val = JSON.stringify( val, null, `    ` );
                        }
                        fs.writeFileSync( filename, val );
                        if ( rUnit.test( filename ) ) {
                            units.push( {
                                filename,
                                "label": path.relative( fixtureDir, filename ),
                                type,
                            } );
                        }
                    }
                }
            }
        };
        for ( const { name, tree, type } of dirUnits ) {
            generateTree( path.join( fixtureDir, name ), tree, type );
        }
    }

    const executeFactory = command => cwd => new Promise( ( resolve, reject ) => exec(
        command,
        {
            cwd,
            "env": process.env,
        },
        error => ( error ? reject( error ) : resolve() )
    ) );

    const now = Date.now();
    const setupPromises = [];

    if ( npmInstall.length ) {
        console.log( `setup: npm install for fixtures` );
        setupPromises.push( ...npmInstall.map( executeFactory( `npm install` ) ) );
    }

    const rollups = units.filter( ( { filename } ) => filename.startsWith( `${ fixtureDir }/` ) );

    if ( rollups.length ) {
        console.log( `setup: rollup` );

        const { rollup } = require( `rollup` );
        const commonjs = require( `@rollup/plugin-commonjs` );
        const json = require( `@rollup/plugin-json` );
        const { nodeResolve } = require( `@rollup/plugin-node-resolve` );
        const wiresRollup = require( `${ process.env.WIRES_DIR }/rollup.js` );

        const maxListeners = process.getMaxListeners();
        process.setMaxListeners( Math.max( units.length, maxListeners ) );

        const promises = rollups.map( async ( { filename, label, type } ) => {
            let bundle;
            try {
                const plugins = type === `c` ? [
                    wiresRollup(),
                    nodeResolve(),
                    json(),
                    commonjs( {
                        "ignoreDynamicRequires": true,
                        "requireReturnsDefault": true,
                    } ),
                ] : [ wiresRollup(), json() ];
                const inputOptions = {
                    "input": filename,
                    plugins,
                };
                const outputOptions = {
                    "exports": `auto`,
                    "file": `${ filename }.rollup.${ type === `m` ? `m` : `` }js`,
                    "format": type === `m` ? `es` : `cjs`,
                };
                bundle = await rollup( inputOptions );
                await bundle.generate( outputOptions );
                await bundle.write( outputOptions );
                units.push( {
                    "filename": outputOptions.file,
                    "label": `${ label } (rollup)`,
                    type,
                } );
            } finally {
                if ( bundle ) {
                    bundle.close();
                }
            }
        } );

        if ( maxListeners !== process.getMaxListeners() ) {
            Promise.allSettled( promises ).finally( () => process.setMaxListeners( maxListeners ) );
        }

        setupPromises.push( ...promises );
    }

    Promise.allSettled( setupPromises )
        .then( outcomes => {
            if ( outcomes.length ) {
                const failed = outcomes.reduce( ( hasFailed, { reason, status } ) => {
                    if ( status === `rejected` ) {
                        console.error( reason );
                        return true;
                    }
                    return hasFailed;
                }, false );
                if ( failed ) {
                    throw new Error( `setup failed` );
                }
                console.log( `setup done in ${ Date.now() - now }ms\n` );
            }
            // eslint-disable-next-line no-nested-ternary
            units.sort( ( u1, u2 ) => ( u1.label < u2.label ? -1 : ( u1.label > u2.label ? 1 : 0 ) ) );
            fs.writeFileSync( jsonFile, JSON.stringify( units ) );
            // eslint-disable-next-line no-extend-native
            Object.prototype.__MODIFIED_PROTOTYPE = true;
            return run( units );
        } );
}
