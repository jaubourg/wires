"use strict";

try {
    require( `#` );
} catch ( e ) {
    require( `..` );
    // eslint-disable-next-line no-console
    console.log( `wires included\n` );
    require( `#` );
}

const files = new Set( process.argv.slice( 2 ) );

const fs = require( `fs` );
const fse = require( `fs-extra` );
const nodeunit = require( `nodeunit` );
const path = require( `path` );

const rCleanFunction = /^.*\r?\n|\r?\n.*$/g;
const rDirUnit = /\.dirunit\.js$/;
const rUnit = /\.unit\.js$/;

const unitDir = path.resolve( __dirname, `units` );
const fixtureDir = path.resolve( __dirname, `fixture` );

const dirUnits = {};
const units = [];

for ( const basename of fs.readdirSync( unitDir ) ) {
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

( function generateTree( dir, tree ) {
    fs.mkdirSync( dir );
    for ( const key of Object.keys( tree ) ) {
        const val = tree[ key ];
        let filename;
        if ( key[ 0 ] === `/` ) {
            generateTree( path.join( dir, key.substr( 1 ) ), val, units );
        } else {
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

nodeunit.reporters.minimal.run( units, null, error => {
    if ( error ) {
        // eslint-disable-next-line no-console
        console.error( error );
        throw error;
    }
} );
