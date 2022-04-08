"use strict";

require( `./build` );

const { execSync } = require( `child_process` );
const fs = require( `fs` );
const path = require( `path` );

const [ , , VERSION ] = process.argv;

const baseDir = path.resolve( __dirname, `..` );
const publishDir = path.resolve( baseDir, `publish` );

// copies to publish dir while respecting .npmignore
{
    const filter = ( () => {
        const rSpecial = /(\.|\*\*?|\/|\^|\^$)/g;
        const regExp = new RegExp( `^${ baseDir }(?:${
            [
                ...( new Set( [
                    ...fs.readFileSync( `${ __dirname }/../.npmignore`, `utf8` ).trim().split( `\n` ),
                    `/node_modules`,
                    `/publish`,
                ] ) ),
            ]
                .map( line => line.replace(
                    rSpecial,
                    // eslint-disable-next-line no-nested-ternary
                    ( _, char ) => ( char === `**` ? `.*` : ( char === `*` ? `[^\\/]*` : `\\${ char }` ) )
                ) )
                .join( `|` )
        })$` );
        return expr => !regExp.test( expr );
    } )();

    const copyRecursive = ( source, target ) => {
        if ( fs.statSync( source ).isDirectory() ) {
            fs.mkdirSync( target );
            for ( const item of fs.readdirSync( source ) ) {
                const sourceItem = path.resolve( source, item );
                if ( filter( sourceItem ) ) {
                    copyRecursive( sourceItem, path.resolve( target, item ) );
                }
            }
        } else {
            fs.copyFileSync( source, target );
        }
    };

    try {
        execSync( `rm -rf ${ JSON.stringify( publishDir ) }` );
    } catch ( _ ) {}

    copyRecursive( baseDir, publishDir );
}

let pkg = require( `../publish/package.json` );

// cleans package.json up
{
    const pkgFiltered = new Set( [ ...( pkg.removePublish || [] ), `private`, `removePublish` ] );

    pkg = Object.fromEntries( Object.entries( pkg ).filter( ( [ k ] ) => !pkgFiltered.has( k ) ) );
    if ( VERSION ) {
        pkg.version = VERSION;
    }

    fs.writeFileSync( path.resolve( publishDir, `package.json` ), JSON.stringify( pkg, null, `    ` ) );
}

// fixes badges in README.md (removes dev ones and fixes versions for the others)
{
    const rBadge = /https:\/\/img.shields.io\/(librariesio|node|npm(?:\/l)?)(?:\/[^?\s]*)?(\?\S*)?/g;
    const rLines = /\n\n\n+/g;
    const rRemove = /\[(?:coverage|dependency|quality|test)-(?:image|url)\]/;
    const types = new Map( [
        [
            `node`,
            {
                "color": `success`,
                "label": `node`,
                "message": pkg.engines.node,
            },
        ],
        [
            `npm`,
            {
                "color": `blue`,
                "label": `npm`,
                "message": pkg.version,
            },
        ],
        [
            `npm/l`,
            {
                "color": `green`,
                "label": `license`,
                "message": pkg.license,
            },
        ],
    ] );
    const readmePath = path.resolve( publishDir, `README.md` );
    fs.writeFileSync(
        readmePath,
        fs.readFileSync( readmePath, `utf8` )
            .split( `\n` )
            .filter( line => !rRemove.test( line ) )
            .join( `\n` )
            .replace( rLines, `\n\n` )
            .replace(
                rBadge,
                ( _, type, query ) => {
                    const { color, label, message, newPath } = types.get( type );
                    return (
                        newPath ?
                            `https://img.shields.io/${ newPath }${ query || `` }` :
                            `https://img.shields.io/static/v1?color=${
                                color
                            }&label=${
                                label
                            }&message=${
                                message
                            }${
                                query ? `&${ query.slice( 1 ) }` : ``
                            }`
                    );
                }
            )
    );
}
