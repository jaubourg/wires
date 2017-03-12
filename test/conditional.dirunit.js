"use strict";

module.exports = {
    "wires.json": {
        "template_#unknown": `template_{#unknown}`,
        "template_?unknown": `template_{?unknown}`,
        "unknown_undefined": `{#unknown}`,
        "unknown_empty": `{?unknown}`,
        "UNEXISTING_undefined": `{#>UNEXISTING}`,
        "UNEXISTING_empty": `{?>UNEXISTING}`,
    },
    "conditional.unit.js"() {
        module.exports = {
            "test"( __ ) {
                __.expect( 10 );
                __.strictEqual( require( `#unexisting` ), undefined );
                __.strictEqual( require( `?unexisting` ), `` );
                __.strictEqual( require( `#>UNEXISTING` ), undefined );
                __.strictEqual( require( `?>UNEXISTING` ), `` );
                __.strictEqual( require( `#UNEXISTING_undefined` ), `undefined` );
                __.strictEqual( require( `#UNEXISTING_empty` ), `` );
                __.strictEqual( require( `#unknown_undefined` ), `undefined` );
                __.strictEqual( require( `#unknown_empty` ), `` );
                __.strictEqual( require( `#template_#unknown` ), `template_undefined` );
                __.strictEqual( require( `#template_?unknown` ), `template_` );
                __.done();
            },
        };
    },
};
