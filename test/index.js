"use strict";

const options = ( args => {
    const rOptions = /^--([a-z]+)=(.+)$/i;
    const actualOptions = {};
    for ( let arg of args ) {
        const test = rOptions.exec( arg );
        if ( test ) {
            actualOptions[ test[ 1 ] ] = test[ 2 ].trim();
        } else {
            if ( !actualOptions.map ) {
                actualOptions.map = {};
            }
            actualOptions.map[ `${ arg }.js` ] = true;
        }
    }
    return actualOptions;
} )( process.argv.slice( 2 ) );

const _ = require( `lodash` );
const fs = require( `fs` );
const fse = require( `fs-extra` );
const nodeunit = require( `nodeunit` );
const path = require( `path` );

const rCleanFunction = /^.*\r?\n|\r?\n.*$/g;
const rDirUnit = /\.dirunit\.js$/;
const rUnit = /\.unit\.js$/;

const unitDir = __dirname;
const fixtureDir = path.join( __dirname, `fixture` );

const dirUnits = {};
const units = [];

fs.readdirSync( unitDir ).forEach( basename => {
    if ( options.map && !options.map[ basename ] ) {
        return;
    }
    const filename = path.join( unitDir, basename );
    if ( rUnit.test( filename ) ) {
        units.push( filename );
    } else if ( rDirUnit.test( filename ) ) {
        dirUnits[ `/${ path.basename( filename, `.dirunit.js` ) }` ] = require( filename );
    }
} );

process.on( `exit`, () => {
    try {
        fse.removeSync( fixtureDir );
    } catch ( e ) {}
} );

( function generateTree( dir, tree ) {
    fs.mkdirSync( dir );
    _.forOwn( tree, ( val, key ) => {
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
    } );
} )( fixtureDir, dirUnits );

// eslint-disable-next-line no-extend-native
Object.prototype.__MODIFIED_PROTOTYPE = true;

( nodeunit.reporters[ options.reporter ] || nodeunit.reporters.default ).run( units, null, error => {
    if ( error ) {
        // eslint-disable-next-line no-console
        console.error( error );
        throw error;
    }
} );
