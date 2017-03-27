/* eslint-disable no-magic-numbers, no-param-reassign */

"use strict";

const stack = ( func, max ) => {
    const prepareStackTrace = Error.prepareStackTrace;
    const stackTraceLimit = Error.stackTraceLimit;
    try {
        Error.stackTraceLimit = max;
        Error.prepareStackTrace = ( _, stackTrace ) => stackTrace;
        const target = {};
        Error.captureStackTrace( target, func );
        return target.stack;
    } finally {
        Error.prepareStackTrace = prepareStackTrace;
        Error.stackTraceLimit = stackTraceLimit;
    }
};

const whereAmI = depth => {
    if ( depth == null ) {
        depth = 0;
    } else if ( !Number.isInteger( depth ) || ( depth > 0 ) ) {
        throw new Error( `negative integer expected` );
    }
    depth = -depth;
    return stack( whereAmI, depth + 1 )[ depth ];
};
whereAmI.stack = () => stack( whereAmI.stack, Infinity );

module.exports = whereAmI;
