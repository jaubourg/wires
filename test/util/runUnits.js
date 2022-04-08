/* eslint-disable no-console */

"use strict";

const { exec } = require( `child_process` );
const fs = require( `fs` );
const fse = require( `fs-extra` );
const path = require( `path` );
const run = require( `./run` );

const rCleanFunction = /^.*\r?\n|\r?\n.*$/g;
const rDirUnit = /\.dirunit\.js$/;
const rUnit = /\.unit\.js$/;

const fixtureDir = path.resolve( __dirname, `../fixture` );
const unitDir = path.resolve( __dirname, `../units/${ process.argv[ 2 ] }` );

process.on( `exit`, () => {
    try {
        fse.removeSync( fixtureDir );
    } catch ( e ) {}
} );

const files = new Set( process.argv.slice( 3 ) );

const dirUnits = {};
const units = [];

for ( const basename of fs.readdirSync( unitDir ) ) {
    if ( !files.size || files.has( basename ) ) {
        const filename = path.join( unitDir, basename );
        if ( rUnit.test( filename ) ) {
            units.push( {
                filename,
                "label": basename,
            } );
        } else if ( rDirUnit.test( filename ) ) {
            dirUnits[ `/${ path.basename( filename, `.dirunit.js` ) }` ] = require( filename );
        }
    }
}

const npmInstall = [];

( function generateTree( dir, tree ) {
    fs.mkdirSync( dir );
    for ( const key of Object.keys( tree ) ) {
        const val = tree[ key ];
        let filename;
        if ( key[ 0 ] === `/` ) {
            generateTree( path.join( dir, key.slice( 1 ) ), val );
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
                units.push( {
                    filename,
                    "label": path.relative( fixtureDir, filename ),
                } );
            }
        }
    }
} )( fixtureDir, dirUnits );

// eslint-disable-next-line no-extend-native
Object.prototype.__MODIFIED_PROTOTYPE = true;

const executeFactory = command => cwd => new Promise( ( resolve, reject ) => exec(
    command,
    {
        cwd,
        "env": process.env,
    },
    error => ( error ? reject( error ) : resolve() )
) );

const setupPromises = [];

const now = Date.now();

if ( npmInstall.length ) {
    console.log( `setup: npm install for fixtures` );
    setupPromises.push( ...npmInstall.map( executeFactory( `npm install` ) ) );
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
        return run( units );
    } )
    .catch( e => setTimeout( () => {
        throw e;
    } ) );
