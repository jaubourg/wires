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
            async test( __ ) {
                __.plan( 20 );
                await importAndRequire.all( [
                    [ `#unexisting`, undefined ],
                    [ `?unexisting`, `` ],
                    [ `#>UNEXISTING`, undefined ],
                    [ `?>UNEXISTING`, `` ],
                    [ `#UNEXISTING_undefined`, `undefined` ],
                    [ `#UNEXISTING_empty`, `` ],
                    [ `#unknown_undefined`, `undefined` ],
                    [ `#unknown_empty`, `` ],
                    [ `#template_#unknown`, `template_undefined` ],
                    [ `#template_?unknown`, `template_` ],
                ] ).strictEqual();
            },
        };
    },
};
