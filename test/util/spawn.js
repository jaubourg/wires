"use strict";

const spawn = require( `child_process` ).spawn;

module.exports = options => new Promise( ( resolve, reject ) => {
    let cwd;
    if ( options.cwd ) {
        cwd = process.cwd();
        process.chdir( options.cwd );
    }
    const child = spawn( options.command || process.execPath, options.args, {
        "env": options.env || process.env,
        "stdio": options.stdio || `inherit`,
    } )
        .on( `close`, code => ( code ? reject( new Error( `bad code ${ code }` ) ) : resolve() ) )
        .on( `error`, reject );
    if ( options.cwd ) {
        process.chdir( cwd );
    }
    if ( options.onCreation ) {
        options.onCreation( child );
    }
} );
