/* eslint-disable max-lines */
"use strict";

const createReporter = require( `tap-diff` );
const fs = require( `fs` );
const path = require( `path` );
const tape = require( `tape` );

const COMPARE = Symbol( `compare` );
const COMPARE_IMPORT = Symbol( `compare import` );
const COMPARE_REQUIRE = Symbol( `compare require` );
const TEST = Symbol( `test` );
const TEST_IMPORT = Symbol( `test import` );
const TEST_REQUIRE = Symbol( `test require` );
const THROW = Symbol( `throw` );
const THROW_IMPORT = Symbol( `throw import` );
const THROW_REQUIRE = Symbol( `throw require` );

const asyncThrowMethods = new Map( [ [ `throws`, `rejects` ], [ `doesNotThrow`, `resolves` ] ] );

class ImportAndRequire {
    #expression;
    #importFunction;
    #tapeObject;
    #requireFunction;
    constructor( importFunction, requireFunction, tapeObject, expression ) {
        this.#expression = expression;
        this.#importFunction = importFunction;
        this.#tapeObject = tapeObject;
        this.#requireFunction = requireFunction;
    }
    async [ COMPARE ]( tapeMethod, expression2, message ) {
        await this[ COMPARE_IMPORT ]( tapeMethod, expression2, message );
        this[ COMPARE_REQUIRE ]( tapeMethod, expression2, message );
    }
    async [ COMPARE_IMPORT ]( tapeMethod, expression2, message ) {
        await this.#tapeObject[ tapeMethod ](
            await this.#importFunction( this.#expression ),
            await this.#importFunction( expression2 ),
            `import( ${ JSON.stringify( this.#expression ) } )${ message ? `: ${ message }` : `` }`
        );
    }
    [ COMPARE_REQUIRE ]( tapeMethod, expression2, message ) {
        this.#tapeObject[ tapeMethod ](
            this.#requireFunction( this.#expression ),
            this.#requireFunction( expression2 ),
            `require( ${ JSON.stringify( this.#expression ) } )${ message ? `: ${ message }` : `` }`
        );
    }
    async [ TEST ]( tapeMethod, expected, message ) {
        await this[ TEST_IMPORT ]( tapeMethod, expected, message );
        this[ TEST_REQUIRE ]( tapeMethod, expected, message );
    }
    async [ TEST_IMPORT ]( tapeMethod, expected, message ) {
        await this.#tapeObject[ tapeMethod ](
            ( await this.#importFunction( this.#expression ) ).default,
            expected,
            `import( ${ JSON.stringify( this.#expression ) } )${ message ? `: ${ message }` : `` }`
        );
    }
    [ TEST_REQUIRE ]( tapeMethod, expected, message ) {
        this.#tapeObject[ tapeMethod ](
            this.#requireFunction( this.#expression ),
            expected,
            `require( ${ JSON.stringify( this.#expression ) } )${ message ? `: ${ message }` : `` }`
        );
    }
    async [ THROW ]( tapeMethod, expected, message ) {
        await this[ THROW_IMPORT ]( tapeMethod, expected, message );
        this[ THROW_REQUIRE ]( tapeMethod, expected, message );
    }
    async [ THROW_IMPORT ]( tapeMethod, expected, message ) {
        await this.#tapeObject[ asyncThrowMethods.get( tapeMethod ) ](
            () => this.#importFunction( this.#expression ),
            expected,
            `import( ${ JSON.stringify( this.#expression ) } )${ message ? `: ${ message }` : `` }`
        );
    }
    [ THROW_REQUIRE ]( tapeMethod, expected, message ) {
        this.#tapeObject[ tapeMethod ](
            () => this.#requireFunction( this.#expression ),
            expected,
            `require( ${ JSON.stringify( this.#expression ) } )${ message ? `: ${ message }` : `` }`
        );
    }
    deepEqual( expected, message ) {
        return this[ TEST ]( `deepEqual`, expected, message );
    }
    deepImportEqual( expected, message ) {
        return this[ TEST_IMPORT ]( `deepEqual`, expected, message );
    }
    deepRequireEqual( expected, message ) {
        return this[ TEST_REQUIRE ]( `deepEqual`, expected, message );
    }
    doesNotThrow( expected, message ) {
        return this[ THROW ]( `doesNotThrow`, expected, message );
    }
    doesNotThrowImport( expected, message ) {
        return this[ THROW_IMPORT ]( `doesNotThrow`, expected, message );
    }
    doesNotThrowRequire( expected, message ) {
        return this[ THROW_REQUIRE ]( `doesNotThrow`, expected, message );
    }
    notDeepEqual( expected, message ) {
        return this[ TEST ]( `notDeepEqual`, expected, message );
    }
    notDeepImportEqual( expected, message ) {
        return this[ TEST_IMPORT ]( `notDeepEqual`, expected, message );
    }
    notDeepRequireEqual( expected, message ) {
        return this[ TEST_REQUIRE ]( `notDeepEqual`, expected, message );
    }
    notSameAs( expression2, message ) {
        return this[ COMPARE ]( `notStrictEqual`, expression2, message );
    }
    notSameImportAs( expression2, message ) {
        return this[ COMPARE_IMPORT ]( `notStrictEqual`, expression2, message );
    }
    notSameRequireAs( expression2, message ) {
        return this[ COMPARE_REQUIRE ]( `notStrictEqual`, expression2, message );
    }
    notStrictEqual( expected, message ) {
        return this[ TEST ]( `notStrictEqual`, expected, message );
    }
    notStrictImportEqual( expected, message ) {
        return this[ TEST_IMPORT ]( `notStrictEqual`, expected, message );
    }
    notStrictRequireEqual( expected, message ) {
        return this[ TEST_REQUIRE ]( `notStrictEqual`, expected, message );
    }
    sameAs( expression2, message ) {
        return this[ COMPARE ]( `strictEqual`, expression2, message );
    }
    sameImportAs( expression2, message ) {
        return this[ COMPARE_IMPORT ]( `strictEqual`, expression2, message );
    }
    sameRequireAs( expression2, message ) {
        return this[ COMPARE_REQUIRE ]( `strictEqual`, expression2, message );
    }
    strictEqual( expected, message ) {
        return this[ TEST ]( `strictEqual`, expected, message );
    }
    strictImportEqual( expected, message ) {
        return this[ TEST_IMPORT ]( `strictEqual`, expected, message );
    }
    strictRequireEqual( expected, message ) {
        return this[ TEST_REQUIRE ]( `strictEqual`, expected, message );
    }
    throws( expected, message ) {
        return this[ THROW ]( `throws`, expected, message );
    }
    throwsImport( expected, message ) {
        return this[ THROW_IMPORT ]( `throws`, expected, message );
    }
    throwsRequire( expected, message ) {
        return this[ THROW_REQUIRE ]( `throws`, expected, message );
    }
}

const RESOLVE_OR_REJECT = Symbol( `resolve or reject` );

const tapeExtension = {
    async [ RESOLVE_OR_REJECT ]( block, tapeMethod, args ) {
        let result;
        let error;
        try {
            result = await block();
        } catch ( e ) {
            error = e;
        }
        return this[ tapeMethod ]( () => {
            if ( error ) {
                throw error;
            }
            return result;
        }, ...args );
    },
    importAndRequireFactory( importFunction, requireFunction ) {
        const fn = expression => new ImportAndRequire( importFunction, requireFunction, this, expression );
        fn.all = list => new Proxy( ImportAndRequire.prototype, {
            "get": ( proto, name ) => (
                ( typeof proto[ name ] === `function` ) ?
                    ( ...additional ) => {
                        const exec = args => {
                            if ( !Array.isArray( args ) ) {
                                // eslint-disable-next-line no-param-reassign
                                args = [ args ];
                            }
                            const [ expression, ...rest ] = args;
                            return fn( expression )[ name ]( ...rest, ...additional );
                        };
                        if ( /require/i.test( name ) ) {
                            list.forEach( exec );
                            return undefined;
                        }
                        return Promise.allSettled( list.map( exec ) );
                    } :
                    undefined
            ),
        } );
        return fn;
    },
    rejects( block, ...args ) {
        return this[ RESOLVE_OR_REJECT ]( block, `throws`, args );
    },
    resolves( block, ...args ) {
        return this[ RESOLVE_OR_REJECT ]( block, `doesNotThrow`, args );
    },
};

const extendTape = fn => ( __, ...args ) => {
    if ( !__[ RESOLVE_OR_REJECT ] ) {
        Object.assign( Object.getPrototypeOf( __ ), tapeExtension );
    }
    return fn( __, ...args );
};

const fixtureDir = `${ path.resolve( `${ __dirname }/../fixture` ) }/`;
const rMethod = /(\( __ \) \{)$/gm;

const patchFile = filename => {
    if ( !filename.startsWith( fixtureDir ) ) {
        return;
    }
    const content = fs.readFileSync( filename, `utf8` );
    const patched = content.replace(
        rMethod,
        `$1 const importAndRequire = __.importAndRequireFactory( e => import( e ), require );`
    );
    if ( patched !== content ) {
        fs.writeFileSync( filename, patched );
    }
};

module.exports = units => {
    tape.createStream().pipe( createReporter() ).pipe( process.stdout );
    for ( const { filename, label } of units ) {
        patchFile( filename );
        for ( const [ name, fn ] of Object.entries( require( filename ) ) ) {
            tape.test( `${ label }: ${ JSON.stringify( name ) }`, extendTape( fn ) );
        }
    }
};
