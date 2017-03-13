"use strict";

const path = require( `path` );

function command( expr ) {
    const array = expr.split( ` ` );
    array[ 0 ] = path.resolve( __dirname, `node_modules/.bin/${ array[ 0 ] }${ path.sep === `/` ? `` : `.cmd` }` );
    return array.join( ` ` );
}

module.exports = grunt => {
    grunt.initConfig( {
        "shell": {
            "eslint": {
                "command": command( `eslint --color -f codeframe .` ),
            },
            "test": {
                "command": `node lib/wires test`,
            },
        },
    } );

    // load npm modules
    grunt.loadNpmTasks( `grunt-shell` );

    // tasks
    grunt.registerTask( `default`, [ `shell:eslint`, `shell:test` ] );
};
