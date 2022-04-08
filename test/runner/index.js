"use strict";

module.exports =
    tasks => tasks.reduce( ( previous, next ) => previous.then( next ), Promise.resolve() ).catch( error => {
        if ( error instanceof Error ) {
            console.error( `latest task failed: ${ error }` );
            console.error( error.stack );
        }
        // eslint-disable-next-line no-process-exit
        process.exit( 1 );
    } );
