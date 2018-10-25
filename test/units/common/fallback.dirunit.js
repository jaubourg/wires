"use strict";

module.exports = {
    "wires.json": {
        "parent?": `parent`,
    },
    "/sub": {
        "wires-defaults.js"() {
            module.exports = {
                "defaultIsUndefined": `defaultIsUndefined`,
                "defaultIsUndefined?": undefined,
                "defaults": false,
                "defaults?": `defaults`,
                "definedInDefaults": `definedInDefaults`,
                "definedInMain?": `fallback definedInMain`,
                "fallbackInDefaults?": `fallbackInDefaults`,
                "fallbackInMain?": ``,
                "fallbackOverride?": `fallback fallbackOverride`,
                "nonExistingInDefaults?": `nonExistingInDefaults`,
                "parent?": `defaults`,
                "path": {
                    "in": {
                        "defaults?": `path.in.defaults`,
                        "falsy": false,
                        "falsy?": `path.in.falsy`,
                        "value": `path.in.value`,
                    },
                },
            };
        },
        "wires.json": {
            "computedWithFallback": `{?computedValue}`,
            "computedWithFallback?": `computed fallback`,
            "computedWithNullFallback": `{?computedValue}`,
            "computedWithNullFallback?": null,
            "computedWithoutFallback": `{?computedValue}`,
            "definedInDefaults?": `fallback definedInDefaults`,
            "definedInMain": `definedInMain`,
            "fallbackInDefaults": ``,
            "fallbackInMain?": `fallbackInMain`,
            "fallbackOverride?": `fallbackOverride`,
            "main": null,
            "main?": `main`,
            "nonExistingInMain?": `nonExistingInMain`,
            "parent": 0,
            "path": {
                "in": {
                    "main?": `path.in.main`,
                    "trueish": `path.in.trueish`,
                    "trueish?": `fallback path.in.trueish`,
                },
                "in?": {
                    "more": `path.in.more`,
                },
            },
            "path?": {
                "in": {
                    "vicious": `path.in.vicious`,
                },
            },
        },
        "fallback.unit.js"() {
            module.exports = {
                "base"( __ ) {
                    const testStrings = [
                        `defaultIsUndefined`,
                        `defaults`, `main`, `parent`,
                        `definedInDefaults`, `definedInMain`,
                        `fallbackInDefaults`, `fallbackInMain`,
                        `fallbackOverride`,
                        `nonExistingInDefaults`, `nonExistingInMain`,
                        `path.in.defaults`, `path.in.falsy`, `path.in.main`,
                        `path.in.more`, `path.in.trueish`, `path.in.vicious`,
                    ];
                    __.expect( testStrings.length );
                    for ( const testString of testStrings ) {
                        __.strictEqual( require( `#${ testString }` ), testString, `require( "#${ testString }" )` );
                    }
                    __.done();
                },
                "computed values"( __ ) {
                    const expected = {
                        "computedWithFallback": `computed fallback`,
                        "computedWithNullFallback": null,
                        "computedWithoutFallback": ``,
                    };
                    const testStrings = Object.keys( expected );
                    __.expect( testStrings.length );
                    for ( const testString of testStrings ) {
                        __.strictEqual(
                            require( `#${ testString }` ),
                            expected[ testString ],
                            `require( "#${ testString }" )`
                        );
                    }
                    __.done();
                },
                "recursive replace"( __ ) {
                    __.expect( 1 );
                    __.deepEqual( require( `#path` ), {
                        "in": {
                            "defaults": `path.in.defaults`,
                            "falsy": `path.in.falsy`,
                            "main": `path.in.main`,
                            "trueish": `path.in.trueish`,
                            "value": `path.in.value`,
                        },
                    }, `fallbacks are recursively replaced` );
                    __.done();
                },
                "get defaults"( __ ) {
                    const expected = {
                        "defaults?": `defaults`,
                        "definedInDefaults?": `fallback definedInDefaults`,
                        "definedInMain?": `fallback definedInMain`,
                        "fallbackInDefaults?": `fallbackInDefaults`,
                        "fallbackInMain?": `fallbackInMain`,
                        "fallbackOverride?": `fallbackOverride`,
                        "main?": `main`,
                        "nonExistingInDefaults?": `nonExistingInDefaults`,
                        "nonExistingInMain?": `nonExistingInMain`,
                        "parent?": `parent`,
                        "path.in.defaults?": `path.in.defaults`,
                        "path.in.falsy?": `path.in.falsy`,
                        "path.in.main?": `path.in.main`,
                        "path.in.trueish?": `fallback path.in.trueish`,
                        "path.in.value?": undefined,
                    };
                    const testStrings = Object.keys( expected );
                    __.expect( testStrings.length );
                    for ( const testString of testStrings ) {
                        __.strictEqual(
                            require( `#${ testString }` ),
                            expected[ testString ],
                            `require( "#${ testString }" )`
                        );
                    }
                    __.done();
                },
            };
        },
    },
};
