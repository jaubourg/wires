"use strict";

const typeString = Function.prototype.call.bind( Object.prototype.toString );

module.exports = value => value && ( typeString( value ) === `[object Object]` );
