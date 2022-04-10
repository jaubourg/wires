"use strict";

const rRollup = /\.rollup.(?:c|m)?js$/;

module.exports = {
    "object": ( tapeObject, filename ) => {
        // eslint-disable-next-line no-param-reassign
        tapeObject.isRollup = rRollup.test( filename );
        return tapeObject;
    },
};
