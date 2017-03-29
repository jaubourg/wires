/* eslint-disable no-magic-numbers, no-param-reassign */

"use strict";

const isAbsolute = require( `path` ).isAbsolute;

const whoCalled = () => {
    const prepareStackTrace = Error.prepareStackTrace;
    const stackTraceLimit = Error.stackTraceLimit;
    try {
        Error.stackTraceLimit = 2;
        Error.prepareStackTrace = ( _, stackTrace ) => stackTrace;
        const target = {};
        Error.captureStackTrace( target, whoCalled );
        const filename = target.stack[ 1 ].getFileName();
        return isAbsolute( filename ) ? require.cache[ filename ] : undefined;
    } finally {
        Error.prepareStackTrace = prepareStackTrace;
        Error.stackTraceLimit = stackTraceLimit;
    }
};

module.exports = whoCalled;
