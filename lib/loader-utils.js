"use strict";

const { "cache": getConfig } = require( `./config/Config` );
const { join } = require( `path` );

const exportableDir = join( __dirname, `exportable/` );

// eslint-disable-next-line no-magic-numbers
const deBypass = expression => expression.slice( 2 );

const rBypass = /^::/;
const rRoute = /^[~>:]|{[#?]/;
const rValue = /^[#?]|^\s*\(\s*(?:bool(?:ean)?|num(ber)?)\s*\)/;

const isBypass = expression => rBypass.test( expression );
const isExportable = expression => expression.startsWith( exportableDir );
const isRoute = expression => rRoute.test( expression );
const isValue = expression => rValue.test( expression );

module.exports = {
    deBypass,
    getConfig,
    isBypass,
    isExportable,
    isRoute,
    isValue,
};
