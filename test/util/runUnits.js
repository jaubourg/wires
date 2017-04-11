/* eslint-disable no-console */

"use strict";

const fs = require( `fs` );
const fse = require( `fs-extra` );
const nodeunit = require( `nodeunit` );
const path = require( `path` );

const rCleanFunction = /^.*\r?\n|\r?\n.*$/g;
const rDirUnit = /\.dirunit\.js$/;
const rUnit = /\.unit\.js$/;

const fixtureDir = path.resolve( __dirname, `../fixture` );
const unitDir = path.resolve( __dirname, `../units/${ process.argv[ 2 ] }` );

const files = new Set( process.argv.slice( 3 ) );

const dirUnits = {};
const units = [];

for ( const basename of fs.readdirSync( unitDir ) ) {
    if ( basename === `.init.js` ) {
        require( `${ unitDir }/.init.js` );
    }
    if ( !files.size || files.has( basename ) ) {
        const filename = path.join( unitDir, basename );
        if ( rUnit.test( filename ) ) {
            units.push( filename );
        } else if ( rDirUnit.test( filename ) ) {
            dirUnits[ `/${ path.basename( filename, `.dirunit.js` ) }` ] = require( filename );
        }
    }
}

process.on( `exit`, () => {
    try {
        fse.removeSync( fixtureDir );
    } catch ( e ) {}
} );

const npmInstall = [];

( function generateTree( dir, tree ) {
    fs.mkdirSync( dir );
    for ( const key of Object.keys( tree ) ) {
        const val = tree[ key ];
        let filename;
        if ( key[ 0 ] === `/` ) {
            generateTree( path.join( dir, key.substr( 1 ) ), val, units );
        } else {
            if ( key === `package.json` ) {
                npmInstall.push( dir );
            }
            filename = path.join( dir, key );
            fs.writeFileSync(
                filename,
                typeof val === `function` ?
                    `"use strict";\n${ String( val ).replace( rCleanFunction, `` ) }` :
                    JSON.stringify( val, null, `    ` ),
                `utf8`
            );
            if ( rUnit.test( filename ) ) {
                units.push( filename );
            }
        }
    }
} )( fixtureDir, dirUnits );

// eslint-disable-next-line no-extend-native
Object.prototype.__MODIFIED_PROTOTYPE = true;

const run = () => nodeunit.reporters.minimal.run( units, null, error => {
    if ( error ) {
        if ( error.message === `We have got test failures.` ) {
            // eslint-disable-next-line no-process-exit
            process.exit( 1 );
        }
        throw error;

    }
} );

if ( npmInstall.length ) {
    const exec = require( `child_process` ).exec;
    console.log( `npm install for fixtures...` );
    const now = Date.now();
    Promise.all(
        npmInstall.map(
            cwd => new Promise( ( resolve, reject ) => exec(
                `npm install`,
                {
                    cwd,
                    "env": process.env,
                },
                error => ( error ? reject( error ) : resolve() ) )
            )
        )
    )
        .then( () => {
            console.log( `install done in ${ Date.now() - now }ms\n` );
            run();
        } )
        .catch( e => setTimeout( () => {
            throw e;
        } ) );
} else {
    run();
}
