"use strict";

module.exports = function( regexp ) {
    return function( string, callback ) {
        var replaced = string;
        do {
            string = replaced;
            replaced = string.replace( regexp, callback );
        } while ( replaced !== string );
        return replaced;
    };
};
