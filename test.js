/* eslint-disable no-console, no-process-exit */

"use strict";

const runner = tasks => {
    let promise = Promise.resolve();
    for ( const task of tasks ) {
        promise = promise.then( task ).then( () => console.log() );
    }
    return promise.catch( () => process.exit( -1 ) );
};

const exec = ( spawn => ( expression, env ) => () => new Promise( ( resolve, reject ) => {
    const args = expression.split( ` ` );
    const command = args.shift().replace(
        /^@(.+)$/,
        `${ __dirname }/node_modules/.bin/$1${ process.platform === `win32` ? `.cmd` : `` }`
    );
    spawn(
        command,
        args,
        {
            "cwd": process.cwd(),
            env,
            "stdio": `inherit`,
        }
    )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} ) )( require( `child_process` ).spawn );

runner( [
    // lint
    exec( `@eslint --color -f codeframe .` ),
    // test
    exec( `node lib/bin.js unit --reporter=minimal`, {
        "NODE_ENV": `test`,
    } ),
] );
