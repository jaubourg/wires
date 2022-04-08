{{
    const isObject = require( `../isObject` );
    const { joinItems, newValue } = require( `./item` );
    const nullModulePath = require.resolve( `../exportable/null` );

    const parseFactory = ( _options, directory ) => {
        const options = directory ? {
            ..._options,
            directory,
        } : _options;
        const parse = data => {
            if ( data ) {
                if ( typeof data === `string` ) {
                    // eslint-disable-next-line no-undef
                    return peg$parse( data, options );
                }
                if ( Array.isArray( data ) ) {
                    return newValue( data.map( parse ) );
                }
                if ( isObject( data ) ) {
                    const entries = [];
                    const fallbacks = [];
                    for ( const [ key, item ] of Object.entries( data ) ) {
                        ( ( key.slice( -1 ) === `?` ) ? fallbacks : entries ).push( [ key, parse( item ) ] )
                    }
                    const object = entries.length ? Object.fromEntries( entries ) : {};
                    if ( fallbacks.length ) {
                        for ( const [ key, fallback ] of fallbacks ) {
                            const realKey = key.slice( 0, -1 );
                            object[ realKey ] =
                                object.hasOwnProperty( realKey ) ?
                                    object[ realKey ].fallback( fallback ) :
                                    fallback;
                        }
                    }
                    return newValue( object );
                }
            }
            return newValue( data );
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
        return path;
    }
    / &{ return !isPath; } value:value
    {
        return value;
    }
    / &{ return !isPath; } cast:cast result:template
    {
        return cast ? result[ cast ]() : result;
    }
    / result:template
    {
        return result;
    }

path
    = method:pathDirPrefix "/" result:template
    {
        return result[ method ]( directory );
    }
    / method:pathPrefix "/" result:template
    {
        return result[ method ]();
    }
    / ":" result:template
    {
        const resultValue = result.getValue();
        const route = config.getRoute( resultValue );
        if ( !route ) {
            throw new Error( `unknown route ${ JSON.stringify( resultValue ) }` );
        }
        let { value } = route;
        if ( typeof value === `function` ) {
            value = value( ...( route.remaining || [] ) );
        } else if ( typeof value === `string` ) {
            value += ( route.remaining || [] ).join( `/` );
        }
        if ( value === null ) {
            return newValue( nullModulePath );
        }
        const parse = parseFactory( options, route.directory );
        let previous;
        do {
            previous = value;
            value = parse( previous ).getValue();
        } while ( value !== previous );
        return newValue( value );
    }

pathDirPrefix
    = "." parent:"."?
    {
        return parent ? `inParentDir` : `inDir`;
    }

pathPrefix
    = ">"
    {
        return `inCWD`;
    }
    / "~"
    {
        return `inHome`;
    }


value
    = modifier:[#?] env:">"? result:template
    {
        let value;
        if ( env  ) {
            value = result.getEnv( asCode );
        } else {
            const resultValue = result.getValue();
            const paths = config.getPath( resultValue );
            if ( paths.length ) {
                const parse = parseFactory( options );
                value = paths.reduce(
                    ( previous, value ) => ( previous ? previous.fallback( parse( value ) ) : parse( value ) ),
                    undefined
                );
            }
        }
        if ( modifier === `?` ) {
            value = value ? value.fallback( `` ) : newValue( `` );
        }
        return value || newValue( undefined );
    }

cast
    = _ "(" _ cast:castType _ ")" _
    {
        return cast;
    }

castType
    = "bool" "ean"?
    {
        return `castBoolean`;
    }
    / "num" "ber"?
    {
        return `castNumber`;
    }

template
    = items:templateItem*
    {
        return items.length ? ( items.length > 1 ? joinItems( ...items ) : items[ 0 ] ) : newValue( `` );
    }

templateItem
    = "{" value:value "}"
    {
        return value.castString();
    }
    / [^{}]+
    {
        return newValue( text() );
    }

_ = [\t\n\r ]*
