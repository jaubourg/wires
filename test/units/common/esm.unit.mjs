import wiresEnv from "#>WIRES_ENV";

export const basics = __ => {
    __.plan( 1 );
    __.strictEqual( wiresEnv, process.env.WIRES_ENV );
    __.end();
};
