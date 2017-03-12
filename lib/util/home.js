"use strict";

function getHome( env ) {
    if ( env.hasOwnProperty( `HOME` ) && env.HOME ) {
        return env.HOME;
    }
    if ( env.hasOwnProperty( `HOMEPATH` ) && env.HOMEPATH ) {
        if ( env.hasOwnProperty( `HOMEDRIVE` ) && env.HOMEDRIVE ) {
            return env.HOMEDRIVE + env.HOMEPATH;
        }
        return env.HOMEPATH;
    }
    return env.hasOwnProperty( `USERPROFILE` ) && env.USERPROFILE;
}

module.exports = getHome( process.env );
