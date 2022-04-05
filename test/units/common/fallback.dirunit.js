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
                "defaults": NaN,
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
                        "falsy": undefined,
                        "falsy?": `path.in.falsy`,
                        "value": `path.in.value`,
                    },
                },
                "NaN": `(number)  `,
                "NaN?": `fallback`,
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
            "main": ``,
            "main?": `main`,
            "nonExistingInMain?": `nonExistingInMain`,
            "parent": null,
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
                async "base"( __ ) {
                    const list = [
                        `defaultIsUndefined`,
                        `defaults`, `main`, `parent`,
                        `definedInDefaults`, `definedInMain`,
                        `fallbackInDefaults`, `fallbackInMain`,
                        `fallbackOverride`,
                        `nonExistingInDefaults`, `nonExistingInMain`,
                        `path.in.defaults`, `path.in.falsy`, `path.in.main`,
                        `path.in.more`, `path.in.trueish`, `path.in.vicious`,
                    ].map( s => [ `#${ s }`, s ] );
                    __.plan( list.length * 2 );
                    await importAndRequire.all( list ).strictEqual();
                },
                async "computed values"( __ ) {
                    const list = [
                        [ `#computedWithFallback`, `computed fallback` ],
                        [ `#computedWithNullFallback`, null ],
                        [ `#computedWithoutFallback`, `` ],
                    ];
                    __.plan( list.length * 2 );
                    await importAndRequire.all( list ).strictEqual();
                },
                async "recursive replace"( __ ) {
                    __.plan( 2 );
                    await importAndRequire( `#path` ).deepEqual( {
                        "in": {
                            "defaults": `path.in.defaults`,
                            "falsy": `path.in.falsy`,
                            "main": `path.in.main`,
                            "trueish": `path.in.trueish`,
                            "value": `path.in.value`,
                        },
                    }, `fallbacks are recursively replaced` );
                },
                async "get defaults"( __ ) {
                    const list = [
                        [ `#defaults?`, `defaults` ],
                        [ `#definedInDefaults?`, `fallback definedInDefaults` ],
                        [ `#definedInMain?`, `fallback definedInMain` ],
                        [ `#fallbackInDefaults?`, `fallbackInDefaults` ],
                        [ `#fallbackInMain?`, `fallbackInMain` ],
                        [ `#fallbackOverride?`, `fallbackOverride` ],
                        [ `#main?`, `main` ],
                        [ `#nonExistingInDefaults?`, `nonExistingInDefaults` ],
                        [ `#nonExistingInMain?`, `nonExistingInMain` ],
                        [ `#parent?`, `parent` ],
                        [ `#path.in.defaults?`, `path.in.defaults` ],
                        [ `#path.in.falsy?`, `path.in.falsy` ],
                        [ `#path.in.main?`, `path.in.main` ],
                        [ `#path.in.trueish?`, `fallback path.in.trueish` ],
                        [ `#path.in.value?`, undefined ],
                    ];
                    __.plan( list.length * 2 );
                    await importAndRequire.all( list ).strictEqual();
                },
                async "NaN is bad"( __ ) {
                    __.plan( 2 );
                    await importAndRequire( `#NaN` ).strictEqual( `fallback` );
                },
            };
        },
    },
};
