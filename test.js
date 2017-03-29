/* eslint-disable no-console, no-process-exit */

"use strict";

const runner = tasks => {
    let promise = Promise.resolve();
    for ( const task of tasks ) {
        promise = promise.then( task ).then( () => console.log() );
    }
    return promise.catch( error => {
        console.error( `latest task failed: ${ error }` );
        process.exit( 1 );
    } );
};

function merge() {
    const object = {};
    for ( let i = 0; i < arguments.length; i++ ) {
        const current = arguments[ i ];
        if ( current != null ) {
            for ( const key of Object.keys( current ) ) {
                object[ key ] = current[ key ];
            }
        }
    }
    return object;
}

const exec = ( spawn => ( expression, env ) => () => new Promise( ( resolve, reject ) => {
    console.log( `Executing ${ expression }\n` );
    const args = expression.split( /\s+/ );
    const command = args.shift().replace(
        /^@(.+)$/,
        `${ __dirname }/node_modules/.bin/$1${ process.platform === `win32` ? `.cmd` : `` }`
    );
    spawn(
        command,
        args,
        {
            "cwd": process.cwd(),
            "env": merge( process.env, env ),
            "stdio": `inherit`,
        }
    )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} ) )( require( `child_process` ).spawn );

const runTests = ( bin, init ) =>
    exec( `node ${ bin ? `lib/bin.js` : `` } unit --init=${ bin ? ( init || `bin` ) : `local` } --reporter=minimal`, {
        "NODE_ENV": `test`,
    } );

runner( [
    // lint
    exec( `@eslint --color -f codeframe .` ),
    // test with binary
    runTests( true ),
    // test with local
    runTests(),
    // test with local in binary
    runTests( true, `local` ),
] );
