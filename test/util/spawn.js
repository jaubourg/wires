"use strict";

const spawn = require( `child_process` ).spawn;
const Writable = require( `stream` ).Writable;

class Options {
    constructor( options ) {
        this.command = options.command || process.execPath;
        this.args = options.args || [];
        if ( this.command === `npm` ) {
            this.command = process.execPath;
            this.args = [ process.env[ `npm_execpath` ] ].concat( this.args );
        }
        this.cwd = options.cwd || process.cwd();
        if ( options.env ) {
            this.env = {};
            for ( const data of [ process.env, options.env ] ) {
                for ( const key of Object.keys( data ) ) {
                    this.env[ key ] = data[ key ];
                }
            }
        } else {
            this.env = process.env;
        }
        this.stdio = options.stdio || `inherit`;
        if ( this.stdio === `string` ) {
            this.stdio = [ null, `pipe`, `inherit` ];
            this.stdout = ``;
            this.stdoutStream = new Writable();
            this.stdoutStream._write = ( chunk, _, done ) => {
                this.stdout += chunk.toString();
                done();
            };
        }
    }
}

module.exports = rawOptions => new Promise( ( resolve, reject ) => {
    if ( rawOptions.log ) {
        // eslint-disable-next-line no-console
        console.log( rawOptions.log );
    }
    const options = new Options( rawOptions );
    const child = spawn( options.command, options.args, {
        "cwd": options.cwd,
        "env": options.env,
        "stdio": options.stdio,
    } )
        .on( `close`, code => ( code ? reject( new Error( `bad code ${ code }` ) ) : resolve( options.stdout ) ) )
        .on( `error`, reject );
    if ( options.stdoutStream ) {
        child.stdout.pipe( options.stdoutStream );
    }
} );
