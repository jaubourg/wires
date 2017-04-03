"use strict";

const clone = require( `../lib/util/clone` );
const spawn = require( `child_process` ).spawn;

module.exports = ( expression, nodeEnv ) => () => new Promise( ( resolve, reject ) => {
    // eslint-disable-next-line no-console
    console.log( `Executing ${ expression }\n` );
    const args = expression.split( /\s+/ );
    const env = clone( process.env );
    env[ `NODE_ENV` ] = nodeEnv;
    spawn(
        args.shift().replace(
            /^@(.+)$/,
            `${ __dirname }/../node_modules/.bin/$1${ process.platform === `win32` ? `.cmd` : `` }`
        ),
        args,
        {
            "cwd": process.cwd(),
            env,
            "stdio": `inherit`,
        }
    )
        .on( `close`, code => ( code ? reject( code ) : resolve() ) )
        .on( `error`, reject );
} );
