/* eslint-disable no-magic-numbers, no-param-reassign */

"use strict";

const target = {};

const whoCalled = () => {
    const prepareStackTrace = Error.prepareStackTrace;
    const stackTraceLimit = Error.stackTraceLimit;
    try {
        Error.stackTraceLimit = 2;
        Error.prepareStackTrace = ( _, stackTrace ) => stackTrace;
        Error.captureStackTrace( target, whoCalled );
        return target.stack[ 1 ].getFileName();
    } finally {
        Error.prepareStackTrace = prepareStackTrace;
        Error.stackTraceLimit = stackTraceLimit;
    }
};

module.exports = whoCalled;
