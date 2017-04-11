"use strict";

const fs = require( `fs` );
const fse = require( `fs-extra` );
const istanbul = require( `istanbul` );
const path = require( `path` );

const recursiveChange = ( dir, changer ) => {
    fs.readdirSync( dir ).forEach( basename => {
        const filename = path.join( dir, basename );
        if ( fs.statSync( filename ).isDirectory() ) {
            recursiveChange( filename, changer );
        } else if ( path.extname( filename ) === `.js` ) {
            fs.writeFileSync( filename, changer( fs.readFileSync( filename, `utf8` ), filename ), `utf8` );
        }
    } );
};

const base = path.resolve( `${ __dirname }/../..` );

const lib = path.join( base, `lib` );
const save = path.join( base, `_save` );

const collectors = new Set( [
    path.join( lib, `bin.js` ),
    path.join( lib, `cli.js` ),
    path.join( lib, `index.js` ),
] );

const collection = `
process.on( "exit", () => {
    if ( global.__coverage_saved__ ) {
        return;
    }
    global.__coverage_saved__ = true;
    require( "fs" ).writeFileSync(
        ${ JSON.stringify( path.join( base, `coverage.` ) ) } + Date.now() + ".json",
        JSON.stringify( __coverage__ ),
        "utf8"
    );
} );
`;

const rCoverage = /^coverage\.[0-9]+\.json$/;
const rStart = /^("use strict";)?/;

let libRestored = false;
const restoreLib = () => {
    if ( !libRestored ) {
        console.log( `restoring lib` );
        libRestored = true;
        fse.copySync( save, lib );
        fse.removeSync( save );
    }
};

let coverageRemoved = false;
const removeCoverage = () => {
    if ( !coverageRemoved ) {
        console.log( `removing temp coverage files` );
        for ( const file of fs.readdirSync( base ) ) {
            if ( rCoverage.test( file ) ) {
                fse.removeSync( path.join( base, file ) );
            }
        }
    }
};

module.exports = {
    "instrument": () => {
        const now = Date.now();
        fse.copySync( lib, save );
        process.on( `exit`, removeCoverage );
        process.on( `exit`, restoreLib );
        const instr = new istanbul.Instrumenter();
        recursiveChange(
            lib,
            ( content, file ) => {
                const tmp = instr.instrumentSync( content, file );
                return collectors.has( file ) ? tmp.replace( rStart, `$1${ collection }` ) : tmp;
            }
        );
        console.log( `instrumented in ${ Date.now() - now }ms` );
    },
    "report": () => {
        const now = Date.now();
        restoreLib();
        const collector = new istanbul.Collector();
        const reporter = new istanbul.Reporter();
        for ( const file of fs.readdirSync( base ) ) {
            if ( rCoverage.test( file ) ) {
                const filename = path.join( base, file );
                collector.add( require( filename ) );
                fse.removeSync( filename );
            }
        }
        coverageRemoved = true;
        reporter.addAll( [ `lcov`, `clover` ] );
        return new Promise( resolve => reporter.write( collector, false, () => {
            console.log( `coverage report generated in ${ Date.now() - now }ms` );
            resolve();
        } ) );
    },
};
