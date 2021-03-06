"use strict";

module.exports = tasks => {
    let promise = Promise.resolve();
    for ( const task of tasks ) {
        if ( typeof task === `function` ) {
            promise = promise.then( task ).then( () => console.log() );
        }
    }
    return promise.catch( error => {
        if ( error instanceof Error ) {
            console.error( `latest task failed: ${ error }` );
            console.error( error.stack );
        }
        // eslint-disable-next-line no-process-exit
        process.exit( 1 );
    } );
};
