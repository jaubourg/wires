"use strict";

const { readFileSync } = require( `fs` );

const rFile = /^\/\/ (.+)$/;
const rImport = /^import /;
const rJSON = /\.json$/;

// eslint-disable-next-line no-eval
const getJSONData = json => eval(
    [
        `( () => {`,
        `    const array = [];`,
        `    ( ( JSON ) => {`,
        ...json.filter( line => !rImport.test( line ) ),
        `    } )( { stringify: array.push.bind( array ) } );`,
        `    return array;`,
        `} )()`,
    ].join( `\n` )
);

const setInObject = ( object, path, value ) => {
    let target = object;
    const segments = path.split( `/` );
    const last = segments.pop();
    for ( const segment of segments ) {
        target = target[ `/${ segment }` ] || ( target[ `/${ segment }` ] = {} );
    }
    target[ last ] = value;
};

const esmDir = filename => {
    const content = readFileSync( filename, `utf8` );
    const files = new Map();
    const jsonFiles = [];
    const json = [];
    const common = [];
    let current = common;
    for ( const line of content.split( `\n` ) ) {
        const tmp = rFile.exec( line );
        if ( tmp ) {
            const [ , name ] = tmp;
            if ( rJSON.test( name ) ) {
                jsonFiles.push( name );
                current = json;
            } else {
                current = files.get( name );
                if ( !current ) {
                    files.set( name, current = [] );
                }
            }
        } else {
            current.push( line );
        }
    }
    const object = {};
    for ( const [ file, lines ] of files.entries() ) {
        setInObject( object, file, [ ...common, ...lines ].join( `\n` ) );
    }
    const jsonData = getJSONData( [ ...common, ...json ] );
    for ( let i = 0; i < jsonFiles.length; ++i ) {
        setInObject( object, jsonFiles[ i ], jsonData[ i ] );
    }
    return object;
};

module.exports = esmDir;
