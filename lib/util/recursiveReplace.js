"use strict";

module.exports = regexp => function( string, callback ) {
    let original;
    let replaced = string;
    do {
        original = replaced;
        replaced = original.replace( regexp, callback );
    } while ( replaced !== original );
    return replaced;
};
