"use strict";

const { ESLint } = require( `eslint` );
const formatter = require( `eslint-formatter-codeframe` );
const linter = new ESLint();

module.exports = async () => {
    console.log( `linting` );
    const reports = await linter.lintFiles( `${ __dirname }/../..` );
    let hasError = false;
    for ( let i = 0; !hasError && ( i < reports.length ); ++i ) {
        hasError = ( reports[ i ].errorCount || reports[ i ].warningCount );
    }
    if ( hasError ) {
        console.log( formatter( reports ) );
        throw new Error( `linting failed` );
    }
};
