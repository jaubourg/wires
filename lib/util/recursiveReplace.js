"use strict";

module.exports = function( regexp ) {
    return function( string, callback ) {
        var original;
        var replaced = string;
        do {
            original = replaced;
            replaced = original.replace( regexp, callback );
        } while ( replaced !== original );
        return replaced;
    };
};
