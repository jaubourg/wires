{
    const { asCode, directory, isPath } = options;
    const utils = options.utils || ( options.utils = options.parseUtilsFactory(
        options,
        ( s, directory ) => peg$parse(
            s, 
            directory ? {
                asCode,
                "config": options.config,
                directory,
                isPath,
                "parseUtilsFactory": options.parseUtilsFactory,
                "utils": undefined,
            } : options,
        ).value
    ) );
    const output = ( type, value ) => ( {
        type,
        value,
    } );
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
    = "::" .*
    {
        return text().slice( 2 );
    }
    / ">" result:template
    {
        return utils.inCWD( result );
    }
    / "~" result:template
    {
        return utils.inHome( result );
    }
    / "./" result:template
    {
        return utils.inDir( directory, result );
    }
    / "../" result:template
    {
        return utils.inParentDir( directory, result );
    }
    / ":" result:template
    {
        return utils.getRoute( result );
    }


value
    = modifier:[#?] env:">"? result:template
    {
        let value = env ? utils.getEnv( result, asCode ) : utils.getValue( result );
        if ( modifier === `?` ) {
            value = utils.empty( value, `` );
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
        return utils.castBoolean;
    }
    / "num" "ber"?
    {
        return utils.castNumber;
    }

template
    = items:templateItem*
    {
        return utils.join( ...items );
    }

templateItem
    = "{" value:value "}"
    {
        return utils.castString( value );
    }
    / [^{}]+
    {
        return text();
    }

_ = [\t\n\r ]*
