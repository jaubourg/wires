"use strict";

var config = require( "eslint-config-creative-area/factory" )( {} );

config.rules[ "global-require" ] = "off";
config.rules[ "no-sync" ] = "off";

module.exports = config;
