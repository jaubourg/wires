/* eslint-disable func-names, no-empty-function, no-eval, max-lines, prefer-regex-literals */
"use strict";

const serialize = require( `../../../lib/serialize-javascript` );

const testSerialize = ( __, value, expected, deserializeFN ) => {
    const serialized = serialize( value );
    __.strictEqual( typeof serialized, `string` );
    __.strictEqual( serialized, expected );
    if ( deserializeFN ) {
        deserializeFN( eval( `(${ serialized })` ), value );
    }
};

const deepSerialize = ( __, value, expected ) => testSerialize( __, value, expected, __.deepEqual.bind( __ ) );
const strictSerialize = ( __, value, expected ) => testSerialize( __, value, expected, __.strictEqual.bind( __ ) );

module.exports = {
    "is a function"( __ ) {
        __.plan( 1 );
        __.strictEqual( typeof serialize, `function` );
        __.end();
    },
    nullish( __ ) {
        __.plan( 6 );
        strictSerialize( __, null, `null` );
        strictSerialize( __, undefined, `undefined` );
        __.end();
    },
    "special numbers"( __ ) {
        __.plan( 9 );
        strictSerialize( __, Infinity, `Infinity` );
        strictSerialize( __, -Infinity, `-Infinity` );
        testSerialize( __, NaN, `NaN`, v => __.ok( ( typeof v === `number` ) && isNaN( v ) ) );
        __.end();
    },
    JSON( __ ) {
        const data = {
            "str": `string`,
            "num": 0,
            "obj": {
                "foo": `foo`,
            },
            "arr": [ 1, 2, 3 ],
            "bool": true,
            "nil": null,
        };
        const string = String.fromCharCode( 8232 );
        const withUndefined = {
            "undef": undefined,
            "nest": {
                "undef": undefined,
            },
        };
        __.plan( 7 );
        deepSerialize( __, data, JSON.stringify( data ) );
        __.strictEqual( eval( serialize( string ) ), string );
        deepSerialize( __, withUndefined, `{"undef":undefined,"nest":{"undef":undefined}}` );
        __.end();
    },
    collisions( __ ) {
        const codes = `ABDFILMNRSTU`;
        __.plan( codes.length * 6 );
        for ( const code of codes ) {
            const string = `@${ code }${ `${ Math.random() }`.slice( 5, 6 ).padEnd( 1, `0` ) }@`;
            deepSerialize( __, string, JSON.stringify( string ) );
            deepSerialize( __, [ Infinity, `"${ string }` ], `[Infinity,"\\"${ string }"]` );
        }
        __.end();
    },
    functions( __ ) {
        const funcs = [
            [ function() {} ],
            [ function fn() {}, fn => __.strictEqual( fn.name, `fn` ) ],
            [
                function fn() {
                    return true;
                },
                fn => __.strictEqual( fn(), true ),
            ],
            [
                // eslint-disable-next-line no-unused-vars
                function fn( arg1 ) {
                    return new Date( `2016-04-28T22:02:17.156Z` );
                },
                fn => __.strictEqual( fn().getTime(), ( new Date( `2016-04-28T22:02:17.156Z` ) ).getTime() ),
            ],
            [
                function fn() {
                    return function( arg1 ) {
                        return arg1 + 5;
                    };
                },
                fn => __.strictEqual( fn()( 7 ), 12 ),
            ],
        ];
        __.plan( funcs.reduce( ( sum, { length } ) => sum + length + 1, 2 ) );
        for ( const [ func, test ] of funcs ) {
            testSerialize( __, func, `${ func }`, test );
        }
        __.throws( () => serialize( Number ), TypeError );
        __.strictEqual( eval( `(${ serialize( {
            hello() {
                return true;
            },
        } ) })` ).hello(), true );
        __.end();
    },
    "arrow functions"( __ ) {
        const funcs = [
            [ () => {} ],
            [
                () => {
                    // body
                },
            ],
            [
                () => true,
                fn => __.strictEqual( fn(), true ),
            ],
            [
                // eslint-disable-next-line no-unused-vars
                arg1 => new Date( `2016-04-28T22:02:17.156Z` ),
                fn => __.strictEqual( fn().getTime(), ( new Date( `2016-04-28T22:02:17.156Z` ) ).getTime() ),
            ],
            [
                () => arg1 => arg1 + 5,
                fn => __.strictEqual( fn()( 7 ), 12 ),
            ],
        ];
        __.plan( funcs.reduce( ( sum, { length } ) => sum + length + 1, 1 ) );
        for ( const [ func, test ] of funcs ) {
            testSerialize( __, func, `${ func }`, test );
        }
        __.strictEqual( eval( `(${ serialize( {
            "hello": () => true,
        } ) })` ).hello(), true );
        __.end();
    },
    regexps( __ ) {
        const equals = ( r1, r2 ) => {
            __.ok( r1 instanceof RegExp );
            __.strictEqual( r1.flags, r2.flags );
            __.strictEqual( r1.source, r2.source );
        };
        const regexps = [
            [ /abcdef/, `"abcdef", ""` ],
            [ new RegExp( `abcdef` ), `"abcdef", ""` ],
            [ /^abcdef$/gi, `"^abcdef$", "gi"` ],
            [ new RegExp( `^abcdef$`, `gi` ), `"^abcdef$", "gi"` ],
            [ /\..*/, `"\\\\..*", ""` ],
            [
                // eslint-disable-next-line no-useless-escape
                /[<\/script><script>alert('xss')\/\/]/,
                `"[\\u003C\\\\\\u002Fscript\\u003E\\u003Cscript\\u003Ealert('xss')\\\\\\u002F\\\\\\u002F]", ""`,
            ],
        ];
        __.plan( regexps.length * 5 );
        for ( const [ regexp, expected ] of regexps ) {
            testSerialize( __, regexp, `new RegExp(${ expected })`, equals );
        }
        __.end();
    },
    dates( __ ) {
        const equals = ( d1, d2 ) => {
            __.ok( d1 instanceof Date );
            __.strictEqual( d1.getTime(), d2.getTime() );
        };
        __.plan( 11 );
        testSerialize( __, new Date( `2016-04-28T22:02:17.156Z` ), `new Date("2016-04-28T22:02:17.156Z")`, equals );
        strictSerialize( __, `2016-04-28T25:02:17.156Z`, `"2016-04-28T25:02:17.156Z"` );
        testSerialize( __, {
            "date": new Date( `2016-04-28T22:02:17.156Z` ),
        }, `{"date":new Date("2016-04-28T22:02:17.156Z")}`, ( o1, o2 ) => equals( o1.date, o2.date ) );
        __.end();
    },
    maps( __ ) {
        __.plan( 3 );
        testSerialize( __, new Map( [
            [ `a`, 123 ],
            [ null, 456 ],
            [ Infinity, 789 ],
        ] ), `new Map([["a",123],[null,456],[Infinity,789]])`, ( m1, m2 ) => {
            __.deepEqual( [ ...m1.entries() ], [ ...m2.entries() ] );
        } );
        __.end();
    },
    sets( __ ) {
        __.plan( 3 );
        testSerialize(
            __,
            new Set( [ `a`, 123, true, Infinity ] ),
            `new Set(["a",123,true,Infinity])`,
            ( s1, s2 ) => {
                __.deepEqual( [ ...s1.values() ], [ ...s2.values() ] );
            }
        );
        __.end();
    },
    "sparse arrays"( __ ) {
        __.plan( 3 );
        const array = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];
        delete array[ 0 ];
        array.length = 3;
        array[ 5 ] = `wat`;
        deepSerialize( __, array, `Array.prototype.slice.call({"1":2,"2":3,"5":"wat","length":6})` );
        __.end();
    },
    "BigInts"( __ ) {
        const equals = ( b1, b2 ) => {
            __.strictEquals( b1.toString(), b2.toString() );
        };
        __.plan( 7 );
        const b = BigInt( `9999` );
        const o = {
            "t": [ b ],
        };
        testSerialize( __, b, `BigInt("9999")`, equals );
        testSerialize( __, o, `{"t":[BigInt("9999")]}`, ( o1, o2 ) => equals( o1.t[ 0 ], o2.t[ 0 ] ) );
        __.throws( () => serialize( BigInt( `abc` ) ) );
        __.end();
    },
    "URLs"( __ ) {
        const equals = ( u1, u2 ) => {
            __.strictEquals( u1.toString(), u2.toString() );
        };
        __.plan( 3 );
        testSerialize( __, new URL( `https://x.com/` ), `new URL("https://x.com/")`, equals );
        __.end();
    },
    "XSS"( __ ) {
        __.plan( 3 );
        strictSerialize( __, `</script>`, `"\\u003C\\u002Fscript\\u003E"` );
        __.end();
    },
    "options"( __ ) {
        const falsy = [ 0, ``, undefined, null, false ];
        const trueish = [ 1, `_`, {}, [], true ];
        const booleans = [ ...falsy, ...trueish ];
        const ignoreFunctions = booleans;
        const isJSONs = booleans;
        const spaces = [
            ...falsy.map( v => [ v ] ),
            [ ` `, `\n ` ],
            [ 1, `\n ` ],
            [ 2, `\n  ` ],
        ];
        const unsafes = booleans;
        const object = {
            "fn": () => {},
        };
        const perform = ( { ignoreFunction, isJSON, space, spaceStr, spaceStr2, unsafe }, spaceSecond ) => {
            const output = `[${
                spaceStr
            }"${
                ( unsafe === true ) ? `<` : `\\u003C`
            }",${
                spaceStr
            }${
                isJSON ? null : `() => {}`
            },${
                spaceStr
            }${
                ( isJSON || ignoreFunction ) ?
                    `{}` :
                    `{${ spaceStr2 }"fn":${ spaceStr ? ` ` : `` }() => {}${ spaceStr || `` }}`
            }${
                spaceStr ? spaceStr[ 0 ] : ``
            }]`;
            const options = {
                ignoreFunction,
                isJSON,
                space,
                unsafe,
            };
            const serialized = serialize( [ `<`, object.fn, object ], spaceSecond ? space : options );
            __.strictEqual( serialized, output, serialize( spaceSecond ? space : options ) );
        };
        __.plan( ( ignoreFunctions.length * isJSONs.length * spaces.length * unsafes.length ) + spaces.length );
        for ( const [ space, spaceStr = `` ] of spaces ) {
            const spaceStr2 = spaceStr && `${ spaceStr }${ spaceStr.slice( 1 ) }`;
            perform( {
                space,
                spaceStr,
                spaceStr2,
            }, true );
            for ( const ignoreFunction of ignoreFunctions ) {
                for ( const isJSON of isJSONs ) {
                    for ( const unsafe of unsafes ) {
                        perform( {
                            ignoreFunction,
                            isJSON,
                            space,
                            spaceStr,
                            spaceStr2,
                            unsafe,
                        } );
                    }
                }
            }
        }
        __.end();
    },
};
