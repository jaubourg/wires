/* eslint-disable no-console */

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

const base = path.resolve( `${ __dirname }/..` );

const lib = path.join( base, `lib` );
const save = path.join( base, `_save` );

const collectors = new Set( [
    path.join( lib, `bin.js` ),
    path.join( lib, `index.js` ),
] );

const collection = `
process.on( "exit", () => require( "fs" ).writeFileSync(
    ${ JSON.stringify( `${ base }/coverage.` ) } + Date.now() + ".json",
    JSON.stringify( __coverage__ ),
    "utf8"
) );
`;

const rCoverage = /^coverage\.[0-9]+\.json$/;

module.exports = {
    "instrument": () => {
        const now = Date.now();
        fse.copySync( lib, save );
        const instr = new istanbul.Instrumenter();
        recursiveChange(
            lib,
            ( content, file ) => instr.instrumentSync( content, file ) + ( collectors.has( file ) ? collection : `` )
        );
        console.log( `instrumented in ${ Date.now() - now }ms` );
    },
    "report": () => {
        const now = Date.now();
        fse.copySync( save, lib );
        fse.removeSync( save );
        const collector = new istanbul.Collector();
        const reporter = new istanbul.Reporter();
        for ( const file of fs.readdirSync( base ) ) {
            if ( rCoverage.test( file ) ) {
                const filename = path.join( base, file );
                collector.add( require( filename ) );
                fse.removeSync( filename );
            }
        }
        reporter.addAll( [ `lcov`, `clover` ] );
        return new Promise( resolve => reporter.write( collector, false, () => {
            console.log( `coverage report generated in ${ Date.now() - now }ms` );
            resolve();
        } ) );
    },
};
