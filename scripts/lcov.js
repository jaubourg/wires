"use strict";

const { readdirSync, readFileSync, writeFileSync } = require( `fs` );

const rLCOV = /\.lcov$/;
const rPublish = /^SF:publish\//gm;

const dir = `${ __dirname }/..`;

for ( const file of readdirSync( `${ __dirname }/..` ) ) {
    if ( rLCOV.test( file ) ) {
        const path = `${ dir }/${ file }`;
        writeFileSync( path, readFileSync( path, `utf8` ).replace( rPublish, `SF:` ) );
    }
}
