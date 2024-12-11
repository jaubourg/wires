# `wires`

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]
[![License][license-image]][license-url]

[![Coverage Status][coverage-image]][coverage-url]
[![Test Status][test-image]][test-url]

__a simple configuration utility for NodeJS featuring smart module wiring for unobtrusive dependency injection__

## Table of Content

<img align="right" width="22.5%" src="https://raw.githubusercontent.com/jaubourg/wires/master/logo.svg?sanitize=true" style="margin:0 3%">

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Cascading Configuration](#cascading-configuration)
    - [`@namespace` directive](#namespace-directive)
    - [`@root` directive](#root-directive)
- [Syntax](#syntax)
    - [Settings](#settings)
    - [Fallbacks](#fallbacks)
    - [Casting](#casting)
- [Routes](#routes)
    - [Generic](#generic-routes)
    - [Computed](#computed-routes)
- [`import`](#import)
- [Bundlers](#bundlers)
    - [ `rollup.js` ](#rollup)

## Overview

__`wires` augments the filename resolution mechanisms used by `import` and `require()` under the hood as a means to transparently inject configuration into your code.__

*For simplicity's sake, we only provide examples using `require()` in this documentation but everything described here also applies to `import` with minor specificities discussed in [a dedicated section](#import).*

```js
require( "#port" ); // <= http port of the server
require( ":db_driver" ); // <= database driver
require( ":models/user" ); // <= user model
require( ":models/article" ); // <= article model
```

Hash-lead expressions are used to recover settings. Colon-lead expressions are used to leverage routes and inject modules.

Routes and settings are defined in JSON files:

```js
// the following JSON

{
    "port": 80,
    ":db_driver": "mysql/driver",
    ":models/": "./db/model-"
}

// will yield the following results

require( "#port" ) === 80;
require( ":db_driver" ) === require( "mysql/driver" );
require( ":models/user" ) === require ( "/.../db/model-user" );
require( ":models/article" ) === require ( "/.../db/model-article" )

// this alternate JSON

{
    "port": 8080,
    ":db_driver": "./lib/dbDriver",
    ":models/": "models/dbo/"
}

// will yield the following results

require( "#port" ) === 8080;
require( ":db_driver" ) === require( "/.../lib/dbDriver" );
require( ":models/user" ) === require ( "models/dbo/user" );
require( ":models/article" ) === require ( "models/dbo/article" )
```

Not that settings which keys are at-sign-lead are considered as directives and will not appear in your configuration. Currently supported directives are [`@namespace`](#namespace-directive) and [`@root`](#root-directive).

## Getting started

Typically,

1. install `wires` globally: `npm -g install wires`
2. use the `wires` command in lieu of `node`.

So, `node ...`<br>
becomes `wires ...`.

As of version `0.4.0`, `wires` will look for local installations based on the current working directory. This means you can add wires as a dependency to your project and have this specific version take precedence whenever the global command is ran from within said project.

```
> wires --version
v0.4.0 (node v0.12.2)

> npm install --save wires@0.2.0
wires@0.2.0 node_modules\wires
├── temp@0.8.1 (rimraf@2.2.8)
└── lodash@3.6.0

> wires --version
v0.2.0 (node v0.12.2)
```

This behavior is compatible with version `0.2.0` and up.

If you don't want to install `wires` globally, you should use<br>
`npx wires ...`<br>
which will find and execute your locally installed `wires` command.

If you don't want to use the `wires` command, you can use the `node` executable as follows:
- `wires` >= `5`: `node --require=wires --loader=wires ...`
- `wires` < `5`: `node --require=wires ...`

This will enable both the CommonJS and ECMAScript module resolution override.

Alternatively, if you only need CommonJS support, you can manually require `wires` at the beginning of the entry file of your project and use `node` as usual:

```js
require( "wires" );

// rest of your code
```

## Cascading Configuration

wires uses four types of configuration file:

- `wires-defaults.json` contains default settings
- `wires-defaults.XXX.json` contains default settings specific to when the `WIRES_ENV` environment variable is set to `"XXX"`
- `wires.json` contains actual settings
- `wires.XXX.json` contains default settings specific to when the `WIRES_ENV` environment variable is set to `"XXX"`

__Prior to version `3.0`, `wires` did use the `NODE_ENV` environment variable rather than `WIRES_ENV`. Please adjust your projects accordingly when upgrading to version `3.0` and higher.__

Actual configuration depends on the position of the file requiring it in the filesystem hierarchy. Each directory gets its own configuration which is computed as follows:

1. start with an empty object
2. override with `wires-defaults.json` if it exists
3. if `WIRES_ENV` is set to `"XXX"`, override with `wires-defaults.XXX.json` if it exists
4. override with the configuration of the parent directory if it exists and if the `@root` directive isn't set to `true`
5. override with `wires.json` if it exists
6. if `WIRES_ENV` is set to `"XXX"`, override with `wires.XXX.json` if it exists

In practice, you'll rarely use all files at once. Typically, parts of your application will define default values in their respective directories while the main app will set actual settings in the root directory, as in the following example:

```js
// /app/wires.json

{
    "mysql": {
        "user": "root",
        "password": "{#>PASSWORD}",
        "database": "test3"
    }
}

// /app/database/wires-defaults.json

{
    "mysql": {
        "host": "localhost",
        "port": 3306,
        "user": "",
        "password": ""
    }
}

// /app/database/lib/someFile.js

require( "#mysql.host" ) === "localhost";
require( "#mysql.port" ) === 3306,
require( "#mysql.user" ) === "root",
require( "#mysql.password" ) === String( process.env.PASSWORD ),
require( "#mysql.database" ) === "test3"
```

### `@namespace` Directive

Adding in one of your configuration files the directive `@namespace` which value is a string creates a namespace. The namespace isolates the directory and limits its access to the part of the parent configuration defined within said namespace.

Let's go back to the previous example:

```js
// /app/wires.json

{
    "mysql": {
        "user": "root",
        "password": "{#>PASSWORD}",
        "database": "test3"
    }
}

// /app/database/wires-defaults.json

{
    "@namespace": "mysql",

    "host": "localhost",
    "port": 3306,
    "user": "",
    "password": ""
}

// /app/database/lib/someFile.js

require( "#host" ) === "localhost";
require( "#port" ) === 3306,
require( "#user" ) === "root",
require( "#password" ) === String( process.env.PASSWORD ),
require( "#database" ) === "test3"
```

_Note that routes are impervious to namespaces._

### `@root` Directive

Sometimes, it is desirable to isolate your configuration. Set the `@root` directive to true and `wires` will stop climbing any further up the file hierarchy.

See the following example:

```js
// /parent/wires.json

{
    "parentKey": "parent value",
    "childKey": "overidden value"
}

// /parent/child/wires-defaults.json

{
    "@root": true,

    "childKey": "child value"
}

// /parent/child/someFile.js

require( "#parentKey" ) === undefined;
require( "#childKey" ) === "child value";
```

## Syntax

- usual file paths
    + `require( "./lib/myUtil.js" )`
    + `require( "fs" )`
- tilde-slash-lead, for file paths relative to home directory
    + `require( "~/.jshint.json" )`
- chevron-slash-lead, for file paths relative to current working directory
    + `require( ">/logger.js" )`
- hash-lead, to recover settings
    + `require( "#username" )`
    + `require( "#server.db.host" )`
- hash-then-chevron-lead, to recover environment variables
    + `require( "#>PATH" )`
    + `require( "#>WIRES_ENV" )`
- colon-lead, to inject route-based modules
    + `require( ":model/person.js" )`
    + `require( ":cacheFactory" )`
- templated, to construct paths dynamically
    + `require( "./lib/{#vendor}/main.js" )`
    + `require( "nodeunit/reporters/{#unit.reporter}" )`
- two-colons-lead, to bypass `wires` entirely
	+ `require( "::wires-will-not-transform-this" )`

Targeting `undefined` or `null` values in expressions may yield potentially undesirable `"undefined"` or `"null"` in the resulting string. If and when you change the leading `#` to a leading `?` and the targeted value is "falsy" (`undefined`, `null`, `false`, etc...), then the result is an empty string (`""`). For instance:

- the expression `"value is '{#undefinedValue}'"` yields `"value is 'undefined'"`
- the expression `"value is '{?undefinedValue}'"` yields `"value is ''"`

This is especially handy for environment variables that may or may not be set. While `"#>UNSET_VAR"` would yield `"undefined"`, `?>UNSET_VAR` yields `""`.

`{` and `}` are special characters. Since version `5.1`, it is possible to escape them if and when they're needed verbatim:

- the expression `"{ placeholder }"` throws an exception
- the expression `"\\{ placeholder \\}"` yields `"{ placeholder }"`

### Settings

In your configuration files, every object property which name is not colon-lead is a setting.

A setting can be of any type, including an object. When the value of a setting is a string, it accepts the template syntax seen in the previous section.

```js
// /app/wires.json

{
    "number": 56,
    "boolean": false,
    "string": "some string",
    "templateString": "number is {#number}",
    "array": [ 1, 2 ],
    "object": {
        "templateString": "boolean is {#boolean}"
    },
    "env": "{?>SOME_VAR}"
}

// /app/file.js

require( "#number" ) === 56;
require( "#string" ) === "some string";
require( "#templateString" ) === "number is 56";
require( "#array" ); // [ 1, 2 ]
require( "#object.templateString" ) === "boolean is false";
require( "#env" ) === ( process.env.SOME_VAR || "" );
```

### Fallbacks

As of version `2.0`, every object property which name ends with a question mark in your configuration files is a fallback. Fallbacks are useful in situations where a setting may be _empty_ (`""`, `NaN`, `null` or `undefined`) yet you still need a default value for it.

__Prior to version `4.0`, `wires` did consider any _falsy_ value as _empty_ (`0`, `false`, etc). This was changed in order to accommodate casting as introduced in the very same version.__

Let's considering the following situation:

```js
// /app/wires.json

{
    "mysql_user": "{?>SQL_USER}"
}

// /app/mysql/wires-defaults.json

{
    "mysql_user": "root"
}

// /app/mysql/index.js

require( "#mysql_user" ) === ( process.env.SQL_USER || "" );
```

The environment variable `SQL_USER` may not be set and so the setting `mysql_user` may end up as an empty string. Yet, it is still _set_ and the default value defined in `wires-defaults.json` will never be used.

The problem can easily be worked around using a fallback:

```js
// /app/wires.json

{
    "mysql_user": "{?>SQL_USER}"
}

// /app/mysql/wires-defaults.json

{
    "mysql_user?": "root"
}

// /app/mysql/index.js

require( "#mysql_user" ) === ( process.env.SQL_USER || "root" );
```

Fallbacks act like any other setting and can be overridden using the cascading nature of configurations. They can also be recovered programmatically if and when needed.

Coming back to the previous example, if we redefine the fallback in the parent configuration then this new setting will be used in place of `root` as the "fallback value":

```js
// /app/wires.json

{
    "mysql_user": "{?>SQL_USER}",
    "mysql_user?": "admin"
}

// /app/mysql/wires-defaults.json

{
    "mysql_user?": "root"
}

// /app/mysql/index.js

require( "#mysql_user" ) === ( process.env.SQL_USER || "admin" );
require( "#mysql_user?" ) === "admin";
```

Fallbacks also work within settings that are objects themselves. They just disappear when you require the object in its entirety:

```js
// /app/wires.json

{
    "mysql": {
        "user": "{?>SQL_USER}"
    }
}

// /app/mysql/wires-defaults.json

{
    "mysql": {
        "user?": "root"
    }
}

// /app/mysql/index.js

require( "#mysql.user" ) === ( process.env.SQL_USER || "root" );
require( "#mysql.user?" ) === "root";
assert.deepEqual(
    require( "#mysql" ),
    {
        "user": process.env.SQL_USER || "root"
    }
);
```

### Casting

As of version `4.0`, it is possible to cast string values into booleans or numbers in configuration files:

```js
// wires.json

{
    "bool": "(boolean) true",
    "number": "(number) 1204"
}

// file.js

require( "#bool" ) === true;
require( "#number" ) === 1204;
```

It is especially useful when dealing with environment variables:

```js
// wires.json

{
    "size": "(number){?>SIZE}"
}

// file.js

const size = ( process.env.SIZE || "" ).trim();
require( "#size" ) === ( size ? Number( size ) : NaN );
```

Casting follows the following rules:

- For booleans (cast using `(bool)` or `(boolean)`):
    - `"true"` becomes `true`,
    - `"false"` becomes `false`,
    - any other string becomes `null`.
- For numbers (cast using `(num)` or `(number)`), any string that cannot be parsed as a number will give `NaN` as a result.

```js
// wires.json

{
    "true": "(bool) true",
    "false": "(bool) false",
    "null": "(bool) not a boolean",
    "number": "(num) 1204",
    "NaN": "(num) not a number",
}

// file.js

require( "#true" ) === true;
require( "#false" ) === false;
require( "#null" ) === null;
require( "#number" ) === 1204;
isNaN( require( "#NaN" ) );
```

You can put an arbitrary number of spaces after the opening parenthesis and around the closing parenthesis. So the following expressions are all valid and strictly equivalent:

```js
"(bool)true"
"(bool) true"
"( bool)true"
"(bool )true"
"( bool )true"
"( bool) true"
"(bool ) true"
"( bool ) true"
```

As of version `5.1`, it is possible to treat string values as json in configuration files:

```js
// wires.json

{
    "json": "(json) \\{ \"property\": [ 1024 ] \\}"
}

// file.js

require( "#json.property" )[ 0 ] === 1024;
```

It makes it possible to inject complex data structures from environment variables:

```js
// wires.json

{
    "json": "(json) {?>JSON}"
}

// file.js

// if env var JSON === '{ "property": [ 1024 ] }'
require( "#json.property" )[ 0 ] === 1024;
```

If the string provided is not proper JSON, `null` is returned, allowing the use of a fallback:

```js
// wires.json

{
    "jsonWithoutFallback": "(json) not proper json",
    "jsonWithFallback": "(json) not proper json",
    "jsonWithFallback?": 712
}

// file.js

require( "#jsonWithoutFallback" ) === null;
require( "#jsonWithFallBack" ) === 712;
```


## Routes

In your configuration files, every object property which name is colon-lead and does not end with a slash defines a route.

Routes must be strings. Like settings, they do accept the template syntax. The final string must be a path to a file that actually exists.

File paths may refer to a file:

- globally (relying on `NODE_PATH`)
- relatively to the directory of the configuration file (start with `"./"` or `"../"`)
- relatively to the home directory (start with `"~/"`)
- relatively to the current working directory (start with `">/"`)

```js
// /app/wires.json

{
	":dbRequest": "mysql/request",
	":cacheFactory": "../cache/factory",
	":data": ">/data.json"
	":eslint": "~/.eslintrc.json"
}

// /app/some/path/inside/index.js

require( ":dbRequest" ) === require( "mysql/request" );
require( ":cacheFactory" ) === require( "/cache/factory" );
require( ":data" ) === require( "/working/dir/data.json" );
require( ":eslint" ) === require( "/home/me/.eslintrc.json" );
```

As of version `2.1.0`, it is possible to set a route to `null`. Requiring such a route would result in `null`.

```js
// /app/wires.json

{
	":not-implemented-yet": null
}

// /app/some/path/inside/index.js

require( ":not-implemented-yet" ) === null;
```

### Generic Routes

In your configuration files, every object property which name is colon-lead and ends with a slash defines a generic route.

Like normal routes, they must be strings, they do accept the templated syntax and they have the same semantics (`NODE_PATH`, `"./"`, `"../"`, `"~/"`, `">/"` ). However, they may not point to the path of an existing file since the final string will be used as a replacement for the property name in require expressions.

```js
// /app/wires.json

{
    ":dbo/": "./db/model-",
}

// /app/mvc/controllers/mainPage.js

require( ":dbo/client" ) === require( "/app/db/model-client" );
require( ":dbo/car/bmw" ) === require( "/app/db/model-car/bmw" );
```

As of version `2.1.0`, it is possible to set a generic route to `null`. Requiring such a route and its children would result in `null`.

```js
// /app/wires.json

{
    ":to-do/": null,
}

// /app/mvc/controllers/mainPage.js

require( ":to-do/child" ) === null;
require( ":to-do/other/path" ) === null;
```

### Computed Routes

As of version `2.1.0`, in your configuration files, every object property which name is colon-lead and ends with a slash followed by an opening then a closing parenthesis defines a computed route.

They are very similar to generic routes except there is no automatic concatenation performed by `wires`. Rather, the value must be a string pointing to a module that exports a function. This function will be called by `wires` with the path segments as arguments and is expected to return the resulting path.

This sounds quite complicated but let's re-implement the generic route example from the previous section with a computed route:

```js
// /app/wires.json

{
    ":dbo/()": "./helpers/dbo.js",
}

// /app/helpers/dbo.js

module.exports =
    ( ...pathSegments ) =>
        "../db/model-" + pathSegments.join( `/` );

// /app/mvc/controllers/mainPage.js

require( ":dbo/client" ) === require( "/app/db/model-client" );
require( ":dbo/car/bmw" ) === require( "/app/db/model-car/bmw" );
```

Please note that paths returned by the function are resolved relatively to the location of the file where the function is defined.

_Computed Route functions must be defined in CommonJS modules. ECMAScript Modules are __not__ supported here._

It is possible for a computed route function to return `null` : requiring such a route and its children would result in `null`.

```js
// /app/wires.json

{
    ":dbo/()": "./helpers/dbo.js",
}

// /app/helpers/dbo.js

module.exports = () => null; // not implemented yet

// /app/mvc/controllers/mainPage.js

require( ":dbo/client" ) === null;
require( ":dbo/product" ) === null;
```

## `import`

As of version `5.0`, `wires` overrides both static and dynamic import statements. This makes it compatible with ES Module based projects.

Unlike `require`, `import()` needs fully defined paths, file extension included, and fails to fetch `index.js` when targeted at a directory, so you have to keep that in mind when creating routes.

```js
// /app/wires.json

{
    ":dir1": "./dir",
    ":dir2": "./dir/index",
    ":dir3": "./dir/index.js"
}

// /app/dir/index.js

module.exports = "You Found Me!";

// /app/cjs.js

require( `:dir1` ) === "You Found Me!"
require( `:dir2` ) === "You Found Me!"
require( `:dir3` ) === "You Found Me!"

// /app/esm.js

import message1 from ":dir1"; // fails with exception
import message2 from ":dir2"; // fails with exception
import message3 from ":dir3"; // succeeds!

message3 === "You Found Me!";
```

Also, for object values, `wires` will create a named export for every property which name is a proper JavaScript identifier.

```js
// /app/wires.json

{
    "object": {
        "property1": 1,
        "property2": 2,
        "no name export": 3
    }
}

// /app/esm.js
import object, { property1, property2 } from "#object";

object.property1 === 1;
object.property2 === 2;
object[ "no name export" ] === 3;

property1 === 1;
property2 === 2;
```

## Bundlers

A primary goal of `wires` is to be compatible with as many bundlers as possible. The bundle does not need `wires` to run and does not include the core code of the package.

While routes are computed statically, values that depend on environment variables will properly change if the corresponding environment variable changes. `wires` will add a few short functions to the bundle to ensure as much.

For instance, if we have the following situation:

```js

// /wires.json

{
    "server": {
        "keepAlive": "(number) {?>KEEP_ALIVE}",
        "keepAlive": 60,
        "port": "(number) {?>PORT}",
        "port?": 8080
    }
}

// /index.js

import { keepAlive, port } from "#server";

console.log( keepAlive, port );
```

then:
- `node index.js` will output `60 8080`
- `KEEP_ALIVE=30 PORT=80 node index.js` will output `30 80`

If `index.js` is bundled into `bundle.js`:
- `node bundle.js` will output `60 8080`
- `KEEP_ALIVE=30000 PORT=80 node bundle.js` will output `30 80`

### Rollup

As of version `5`, `wires` exposes a `rollup` plugin at `wires/rollup` (it is part of the `wires` package itself).

Simply create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import wires from "wires/rollup";

export default {
    input: "src/index.js",
    output: {
        dir: "output",
        format: "es"
    },
    plugins: [ wires() ],
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

The plugin is compatible with both [`@rollup/plugin-commonjs`](https://www.npmjs.com/package/@rollup/plugin-commonjs) and [`@rollup/plugin-node-resolve`](https://www.npmjs.com/package/@rollup/plugin-node-resolve) which makes it possible to bundle CommonJS projects, provided you set the former's `requireReturnsDefault` options to `true` and put the latter after the `wires` plugin in the list of plugins.

It can also make sense to include [`@rollup/plugin-json`](https://www.npmjs.com/package/@rollup/plugin-json).

```js
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import wires from "wires/rollup";

export default {
    input: "src/index.js",
    output: {
        dir: "output",
        exports: "auto",
        format: "cjs"
    },
    plugins: [
        wires(),
        nodeResolve(),
        json(),
        commonjs( {
            requireReturnsDefault: true
        } )
    ]
};
```

## License

© [Julian Aubourg](mailto:j@ubourg.net), 2012-2022 – licensed under the [MIT license][license-url].

[coverage-image]: https://img.shields.io/coveralls/jaubourg/wires.svg?style=flat-square
[coverage-url]: https://coveralls.io/r/jaubourg/wires
[license-image]: https://img.shields.io/npm/l/wires.svg?style=flat-square
[license-url]: https://raw.githubusercontent.com/jaubourg/wires/master/LICENSE
[node-image]: https://img.shields.io/node/v/wires.svg?style=flat-square
[node-url]: https://npmjs.org/package/wires
[npm-image]: https://img.shields.io/npm/v/wires.svg?style=flat-square
[npm-url]: https://npmjs.org/package/wires
[test-image]: https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fjaubourg%2Fwires%2Fbadge&style=flat-square
[test-url]: https://github.com/jaubourg/wires/actions
