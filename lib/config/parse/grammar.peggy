{{
    const {
        castBoolean,
        castNumber,
        castString,
        empty,
        getEnv,
        inCWD,
        inDir,
        inHome,
        inParentDir,
        isCode,
        join,
        needsFallback,
    } = require( `./util` );
    const isObject = require( `../../isObject` );
    const nullModulePath = require.resolve( `../util/null` );

    const output = ( type, value ) => ( {
        type,
        value,
    } );

    const rFallback = /\?$/;
    const parseFactory = ( _options, directory ) => {
        const options = directory ? Object.assign( {}, _options, {
            directory,
        } ) : _options;
        const parse = data => {
            if ( data ) {
                if ( typeof data === `string` ) {
                    // eslint-disable-next-line no-undef
                    return peg$parse( data, options ).value;
                }
                if ( Array.isArray( data ) ) {
                    return data.map( parse );
                }
                if ( isObject( data ) ) {
                    const object = {};
                    const fallbacks = [];
                    for ( const key of Object.keys( data ) ) {
                        if ( rFallback.test( key ) ) {
                            fallbacks.push( key );
                        } else {
                            object[ key ] = parse( data[ key ] );
                        }
                    }
                    for ( const key of fallbacks ) {
                        const realKey = key.slice( 0, -1 );
                        if ( !object.hasOwnProperty( realKey ) || needsFallback( object[ realKey ] ) ) {
                            object[ realKey ] = parse( data[ key ] );
                        }
                    }
                    return object;
                }
            }
            return data;
        };
        return parse;
    };
}}

{
    const { asCode, config, directory, isPath } = options;
}

start
    = &{ return isPath; } path:path
    {
        return output( `path`, path );
    }
    / &{ return !isPath; } value:value
    {
        return output( `value`, value );
    }
    / &{ return !isPath; } cast:cast result:template
    {
        return output( `value`, cast( result ) );
    }
    / result:template
    {
        return output( isPath ? `path` : `value`, result );
    }

path
    = "::" ":"? .*
    {
        return text().slice( 2 );
    }
    / ">" result:template
    {
        return inCWD( result );
    }
    / "~" result:template
    {
        return inHome( result );
    }
    / "./" result:template
    {
        return inDir( directory, result );
    }
    / "../" result:template
    {
        return inParentDir( directory, result );
    }
    / ":" result:template
    {
        if ( isCode( result ) ) {
            throw new Error( `cannot get route from code` );
        }
        const route = config.getRoute( result );
        if ( !route ) {
            throw new Error( `Unknown route '${ result }'` );
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
        const parse = parseFactory( options, route.directory );
        let previous;
        do {
            previous = value;
            value = parse( previous );
        } while ( value !== previous );
        return value;
    }


value
    = modifier:[#?] env:">"? result:template
    {
        let value;
        if ( env  ) {
            value = getEnv( result, asCode );
        } else {
            if ( isCode( result ) ) {
                throw new Error( `cannot get value from code` );
            }
            const potential = config.getPath( result ).map( parseFactory( options ) );
            let first = true;
            while ( potential.length ) {
                value = first ? potential.pop() : empty( potential.pop(), value );
                first = false;
            }
        }
        if ( modifier === `?` ) {
            value = empty( value, `` );
        }
        return value;
    }

cast
    = _ "(" _ cast:castType _ ")" _
    {
        return cast;
    }

castType
    = "bool" "ean"?
    {
        return castBoolean;
    }
    / "num" "ber"?
    {
        return castNumber;
    }

template
    = items:templateItem*
    {
        return items.length ? ( items.length > 1 ? join( ...items ) : items[ 0 ] ) : ``;
    }

templateItem
    = "{" value:value "}"
    {
        return castString( value );
    }
    / [^{}]+
    {
        return text();
    }

_ = [\t\n\r ]*
