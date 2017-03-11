"use strict";

process.chdir( __dirname );

// eslint-disable-next-line no-console
console.error( JSON.stringify( {
    "noParent": module.parent === null,
    "isMain": require.main === module,
    "argv": process.argv,
    "execArgv": process.execArgv,
    "config": require( "#" ),
} ) );

process.exit( 180 );
