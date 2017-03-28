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
            test( __ ) {
                __.expect( 10 );
                __.strictEqual( wires( `#unexisting` ), undefined );
                __.strictEqual( wires( `?unexisting` ), `` );
                __.strictEqual( wires( `#>UNEXISTING` ), undefined );
                __.strictEqual( wires( `?>UNEXISTING` ), `` );
                __.strictEqual( wires( `#UNEXISTING_undefined` ), `undefined` );
                __.strictEqual( wires( `#UNEXISTING_empty` ), `` );
                __.strictEqual( wires( `#unknown_undefined` ), `undefined` );
                __.strictEqual( wires( `#unknown_empty` ), `` );
                __.strictEqual( wires( `#template_#unknown` ), `template_undefined` );
                __.strictEqual( wires( `#template_?unknown` ), `template_` );
                __.done();
            },
        };
    },
};
