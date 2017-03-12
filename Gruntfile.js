"use strict";

const fs = require( `fs` );
const fse = require( `fs-extra` );
const path = require( `path` );

function command( expr ) {
    const array = expr.split( ` ` );
    array[ 0 ] = path.resolve( __dirname, `node_modules/.bin/${ array[ 0 ] }${ path.sep === `/` ? `` : `.cmd` }` );
    return array.join( ` ` );
}

module.exports = grunt => {
    const lcov = `data.lcov`;
    const lib = `lib`;
    const libSave = `${ lib }-save`;

    grunt.initConfig( {
        "shell": {
            "coveralls": {
                "command": command( `coveralls < ${ lcov }` ),
            },
            "eslint": {
                "command": command( `eslint --color -f codeframe .` ),
            },
            "jscoverage": {
                "command": command( `jscoverage ${ lib } ${ libSave }` ),
            },
            "test": {
                "command": `node bin/wires test`,
            },
            "testWithCoverage": {
                "command": `node bin/wires test --reporter=lcov > ${ lcov }`,
            },
        },
    } );

    // load npm modules
    grunt.loadNpmTasks( `grunt-shell` );

    // tasks
    grunt.registerTask( `default`, [ `shell:eslint`, `shell:test` ] );

    // coverage
    grunt.registerTask( `coverage-file-manipulation`, () => {
        fs.renameSync( lib, `__coverage_tmp` );
        fs.renameSync( libSave, lib );
        fs.renameSync( `__coverage_tmp`, libSave );
        process.on( `exit`, () => {
            fse.removeSync( lib );
            fs.renameSync( libSave, lib );
            fs.unlinkSync( lcov );
        } );
    } );

    grunt.registerTask( `coverage`, [
        `shell:jscoverage`,
        `coverage-file-manipulation`,
        `shell:testWithCoverage`,
        `shell:coveralls`
    ] );
};
