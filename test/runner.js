/* eslint-disable no-console, no-process-exit */

"use strict";

module.exports = tasks => {
    let promise = Promise.resolve();
    for ( const task of tasks ) {
        if ( typeof task === `function` ) {
            promise = promise.then( task ).then( () => console.log() );
        }
    }
    return promise.catch( error => {
        console.error( `latest task failed: ${ error }` );
        process.exit( 1 );
    } );
};
