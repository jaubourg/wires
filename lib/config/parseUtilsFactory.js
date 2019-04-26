/* eslint-disable no-param-reassign */
"use strict";

const isObject = require( `./util/isObject` );
const serialize = require( `serialize-javascript` );

const CODE = Symbol( `code` );
const rFallback = /\?$/;

const needsFallback = v => ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) );

const isCode = v => Boolean( v && v[ CODE ] );

const _argsHaveCode = args => {
    for ( const arg of args ) {
        if ( isCode( arg ) ) {
            return true;
        }
    }
    return false;
};
const factory = f => ( ...args ) => (
    _argsHaveCode( args ) ? {
        [ CODE ]:
            `( ${ f } )( ${ args.map( arg => ( ( arg && arg[ CODE ] ) || serialize( arg ) ) ).join( `, ` ) } )`,
    } : f( ...args )
);
const castBoolean = factory( s => ( ( s = `${ s }`.trim() ) === `true` ) || ( s === `false` ? false : null ) );
const castNumber = factory( s => ( ( ( s = `${ s }`.trim() ) ) ? Number( s ) : NaN ) );
const castString = factory( v => String( v ) );
const empty = factory(
    ( v, e ) => ( ( ( v === `` ) || ( v == null ) || ( ( typeof v === `number` ) && isNaN( v ) ) ) ? e : v )
);
const _getEnv = factory( v => ( v ? process.env[ v ] : process.env ) );
const getEnv = ( v, asCode ) => _getEnv( ( v && v[ CODE ] ) || !asCode ? v : {
    [ CODE ]: serialize( v ),
} );
const join = factory( ( ...items ) => items.join( `` ) );

const _parseFactory = _parse => dir => {
    const parse = data => {
        if ( data ) {
            if ( typeof data === `string` ) {
                return _parse( data, dir );
            }
            if ( Array.isArray( data ) ) {
                return data.map( parse );
            }
            if ( isObject( data ) ) {
                const output = {};
                const fallbacks = [];
                for ( const key of Object.keys( data ) ) {
                    if ( rFallback.test( key ) ) {
                        fallbacks.push( key );
                    } else {
                        output[ key ] = parse( data[ key ] );
                    }
                }
                for ( const key of fallbacks ) {
                    const realKey = key.slice( 0, -1 );
                    if ( !output.hasOwnProperty( realKey ) || needsFallback( output[ realKey ] ) ) {
                        output[ realKey ] = parse( data[ key ] );
                    }
                }
                return output;
            }
        }
        return data;
    };
    return parse;
};

const nullModulePath = require.resolve( `./util/null` );

// eslint-disable-next-line no-shadow
const parseUtilsFactory = ( require => {
    const inCWD = factory( v => {
        const sv = String( v );
        const tmp = require( `path` ).resolve( process.cwd(), sv.replace( /^\//, `` ) );
        return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
    } );
    const inHome = factory( v => {
        const sv = String( v );
        const tmp = require( `path` ).resolve( require( `os` ).homedir(), sv.replace( /^\//, `` ) );
        return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
    } );
    return ( { config }, _parse ) => {
        const parseFactory = _parseFactory( _parse );
        const inDir = factory( ( dir, v ) => {
            const sv = String( v );
            const tmp = require( `path` ).resolve( dir, sv );
            return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
        } );
        const inParentDir = factory( ( dir, v ) => {
            const { dirname, resolve } = require( `path` );
            const sv = String( v );
            const tmp = resolve( dirname( dir ), sv );
            return /\/$/.test( sv ) ? `${ tmp }/` : tmp;
        } );
        const getRoute = expr => {
            if ( expr && expr[ CODE ] ) {
                throw new Error( `cannot get route from code` );
            }
            const route = config._routes.get( expr ) || config._dirRoutes.get( expr );
            if ( !route ) {
                throw new Error( `Unknown route '${ expr }'` );
            }
            let { value } = route;
            if ( typeof value === `function` ) {
                value = value( ...( route.remaining || [] ) );
            } else if ( typeof value === `string` ) {
                value += ( route.remaining || [] ).join( `/` );
            }
            if ( value === null ) {
                return nullModulePath;
            }
            const parse = parseFactory( route.directory );
            let previous;
            do {
                previous = value;
                value = parse( previous );
            } while ( value !== previous );
            return value;
        };
        const getValue = expr => {
            if ( expr && expr[ CODE ] ) {
                throw new Error( `cannot get value from code` );
            }
            const potential = config._data.getPath( expr ).map( parseFactory() );
            let first = true;
            let value;
            while ( potential.length ) {
                value = first ? potential.pop() : empty( potential.pop(), value );
                first = false;
            }
            return value;
        };
        return {
            castBoolean,
            castNumber,
            castString,
            empty,
            getEnv,
            getRoute,
            getValue,
            inCWD,
            inDir,
            inHome,
            inParentDir,
            join,
        };
    };
} )(
    ( () => {
        const cache = new Map();
        return expr => {
            if ( cache.has( expr ) ) {
                return cache.get( expr );
            }
            const mod = require( `::${ expr }` );
            cache.set( expr, mod );
            return mod;
        };
    } )()
);

parseUtilsFactory.execute = ( { type, value } ) => ( isCode( value ) ? {
    "code": value[ CODE ],
    type,
    // eslint-disable-next-line no-eval
    "value": eval( value[ CODE ] ),
} : {
    type,
    value,
} );

module.exports = parseUtilsFactory;
