"use strict";

const exec = require( `./exec` );
const fs = require( `fs` );
const fse = require( `fs-extra` );

const footer = ( file, foot ) => fs.writeFileSync( file, fs.readFileSync( file, `utf8` ) + foot, `utf8` );

const base = `${ __dirname }/..`;

const lib = `${ base }/lib`;
const save = `${ base }/_save`;
const tmp = `${ base }/_tmp`;

const instrumentSave = [
    `${ lib }/bin.js`,
    `${ lib }/index.js`,
];

const coverageCollection = `
process.on( "exit", () => require( "fs" ).writeFileSync(
    ${ JSON.stringify( `${ base }/coverage.` ) } + Date.now() + ".json",
    JSON.stringify( __coverage__ ),
    "utf8"
) );
`;

const rCoverage = /^coverage\.[0-9]+\.json$/;

module.exports = {
    "instrument": () => {
        fse.copySync( lib, save );
        return exec( `@istanbul instrument --output ${ tmp } ${ lib }` )().then( () => {
            fse.copySync( tmp, lib );
            fse.removeSync( tmp );
            for ( const file of instrumentSave ) {
                footer( file, coverageCollection );
            }
        } );
    },
    "report": () => {
        fse.copySync( save, lib );
        fse.removeSync( save );
        const istanbul = require( `istanbul` );
        const collector = new istanbul.Collector();
        const reporter = new istanbul.Reporter();
        for ( const file of fs.readdirSync( base ) ) {
            if ( rCoverage.test( file ) ) {
                collector.add( require( `${ base }/${ file }` ) );
                fse.removeSync( `${ base }/${ file }` );
            }
        }
        reporter.addAll( [ `lcov`, `clover` ] );
        return new Promise( resolve => reporter.write( collector, false, resolve ) );
    },
};
