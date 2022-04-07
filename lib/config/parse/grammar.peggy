{{
    const Item = require( `./Item` );
    const isObject = require( `../../isObject` );
    const nullModulePath = require.resolve( `./null` );

    const rFallback = /\?$/;
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
                    return Item.newValue( data.map( parse ) );
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
                        const item = parse( data[ key ] );
                        const realKey = key.slice( 0, -1 );
                        object[ realKey ] =
                            object.hasOwnProperty( realKey ) ?
                                object[ realKey ].fallback( item ) :
                                item;
                    }
                    return Item.newValue( object );
                }
            }
            return Item.newValue( data );
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
            console.log( `${ value }` );
            value = value( ...( route.remaining || [] ) );
        } else if ( typeof value === `string` ) {
            value += ( route.remaining || [] ).join( `/` );
        }
        if ( value === null ) {
            return Item.newValue( nullModulePath );
        }
        const parse = parseFactory( options, route.directory );
        let previous;
        do {
            previous = value;
            value = parse( previous ).getValue();
        } while ( value !== previous );
        return Item.newValue( value );
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
            const parse = parseFactory( options );
            const paths = config.getPath( resultValue );
            value = paths.reduce(
                ( previous, value ) => previous.fallback( parse( value ) ), Item.newValue( undefined )
            );
        }
        if ( modifier === `?` ) {
            value = value.fallback( `` );
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
        return `castBoolean`;
    }
    / "num" "ber"?
    {
        return `castNumber`;
    }

template
    = items:templateItem*
    {
        return items.length ? ( items.length > 1 ? Item.join( ...items ) : items[ 0 ] ) : Item.newValue( `` );
    }

templateItem
    = "{" value:value "}"
    {
        return value.castString();
    }
    / [^{}]+
    {
        return Item.newValue( text() );
    }

_ = [\t\n\r ]*
