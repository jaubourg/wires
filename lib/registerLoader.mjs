import { fileURLToPath, pathToFileURL } from "url";
import { dirname } from "path";
import { register } from "module";

const thisFilename = fileURLToPath( import.meta.url );
const thisDirname = dirname( thisFilename );

register( pathToFileURL( `${ thisDirname }/../loader.mjs` ) );
