/* eslint-disable no-await-in-loop */
"use strict";

const createReporter = require( `tap-diff` );
const { readdirSync } = require( `fs` );
const { resolve } = require( `path` );
const tape = require( `tape` );

const plugins = readdirSync( resolve( __dirname, `plugins` ) ).map( n => require( `./plugins/${ n }` ) );

const extendTape = ( _fn, filename, isESM ) => async _tapeObject => {
    let fn = _fn;
    let tapeObject = _tapeObject;
    for ( const { "function": func, object } of plugins ) {
        if ( object ) {
            tapeObject = await object( tapeObject, filename, isESM );
        }
        if ( func ) {
            fn = await func( fn, filename, isESM );
        }
    }
    let tmp;
    try {
        tmp = await fn( tapeObject );
    } catch ( e ) {
        tapeObject.doesNotThrow( () => {
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
