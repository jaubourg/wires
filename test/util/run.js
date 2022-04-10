/* eslint-disable no-await-in-loop */
"use strict";

const createReporter = require( `tap-diff` );
const { readdirSync } = require( `fs` );
const { resolve } = require( `path` );
const tape = require( `tape` );

const plugins = readdirSync( resolve( __dirname, `plugins` ) ).map( n => require( `./plugins/${ n }` ) );

const extendTape = ( fn, filename, isESM ) => async ( __, ...args ) => {
    for ( const plugin of plugins ) {
        // eslint-disable-next-line no-param-reassign
        __ = await plugin( __, filename, isESM );
    }
    let tmp;
    try {
        tmp = await fn( __, ...args );
    } catch ( e ) {
        __.doesNotThrow( () => {
            throw e;
        } );
    }
    return tmp;
};

module.exports = async units => {
    const tests = [];
    for ( const { filename, label, type } of units ) {
        const isESM = ( type === `m` );
        const entries = Object.entries( isESM ? await import( filename ) : require( filename ) );
        for ( const [ name, fn ] of entries ) {
            tests.push( [ `${ label } ${ name }`, extendTape( fn, filename, isESM ) ] );
        }
    }
    tape.createStream().pipe( createReporter() ).pipe( process.stdout );
    for ( const [ name, fn ] of tests ) {
        tape.test( name, fn );
    }
};
