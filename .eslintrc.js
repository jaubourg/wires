"use strict";

var config = require( `eslint-config-creative-area/factory` )( {
    "arrowFunctions": true,
    "destructuring": false,
    "dotKeywords": true,
    "lexicalDeclarators": true,
    "numericLiterals": true,
    "objectShorthands": true,
    "restParams": false,
    "spreadOperator": false,
    "templateStrings": true,
} );

config.rules[ `global-require` ] = `off`;
config.rules[ `no-sync` ] = `off`;

module.exports = config;
