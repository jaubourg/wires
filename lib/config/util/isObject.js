"use strict";

const gpo = Object.getPrototypeOf;
const proto = Object.prototype;

module.exports = obj => ( obj != null ) && ( typeof obj === `object` ) && ( gpo( obj ) === proto );
