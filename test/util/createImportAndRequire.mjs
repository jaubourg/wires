import { createRequire } from "module";
import { resolve, sep } from "path";

export const createImportAndRequire = filename => {
    const url = `file://${ resolve( filename ).replace( sep, `/` ) }`;
    return {
        "import": async e => import( await import.meta.resolve( e, url ) ),
        "require": createRequire( url ),
    };
};
