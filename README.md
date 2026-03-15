# `wires`

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]
[![License][license-image]][license-url]

[![Coverage Status][coverage-image]][coverage-url]
[![Test Status][test-image]][test-url]

__A simple configuration utility for Node.js featuring smart module wiring for unobtrusive dependency injection.__

## The Problem

<img align="right" width="22.5%" src="https://raw.githubusercontent.com/jaubourg/wires/master/logo.svg?sanitize=true" style="margin:0 3%">

Every Node.js project eventually runs into the same set of annoyances:

- **Relative path hell.** `require("../../../util/logger")` breaks on every refactor and tells you nothing about what `logger` actually is in context.
- **Config threading.** You read `process.env` at the top of your entry point and pass values down through five layers of function arguments or a shared global — neither is great.
- **Environment switching.** Swapping a real database driver for a test double means either touching application code or maintaining a tangle of `if (NODE_ENV === ...)` branches.

Tools like `dotenv` solve the env-loading part but leave the rest to you. Dependency injection frameworks solve the wiring part but require you to restructure your code around them.

`wires` takes a different approach: it stays out of your application code entirely.

## Overview

__`wires` augments the filename resolution mechanisms used by `import` and `require()` under the hood as a means to transparently inject configuration into your code.__

Your modules keep using plain `require()`. You define what those calls resolve to — and what values they return — in JSON files that sit alongside your code. Switch environments, swap implementations, override settings for a subdirectory: none of it requires touching the modules themselves.

*For simplicity's sake, we only provide examples using `require()` in this documentation, but everything described here also applies to `import` with minor differences discussed in [a dedicated section](#import).*

Here is a quick before/after. Without `wires`:

```js
// before: config is threaded manually, paths are fragile

const port = require("../../../config").port;
const db = require("../../../drivers/mysql");
const User = require("../../../db/model-user");
```

With `wires`:

```js
// after: modules just declare what they need

const port = require("#port");
const db = require(":db_driver");
const User = require(":models/user");
```

The mapping between these expressions and actual values or modules is defined in JSON configuration files:

```json
{
    "port": 80,
    ":db_driver": "mysql/driver",
    ":models/": "./db/model-"
}
```

```js
require("#port") === 80;
require(":db_driver") === require("mysql/driver");
require(":models/user") === require("/.../db/model-user");
require(":models/article") === require("/.../db/model-article");
```

Hash expressions read settings. Colon expressions resolve to modules via routes. Swapping to a different environment is just a matter of providing a different JSON file:

```json
{
    "port": 8080,
    ":db_driver": "./lib/dbDriver",
    ":models/": "models/dbo/"
}
```

```js
require("#port") === 8080;
require(":db_driver") === require("/.../lib/dbDriver");
require(":models/user") === require("models/dbo/user");
require(":models/article") === require("models/dbo/article");
```

Note that settings whose keys are prefixed with `@` are considered directives and will not appear in your configuration. Currently supported directives are [`@namespace`](#namespace-directive) and [`@root`](#root-directive).

## Table of Contents

- [Getting Started](#getting-started)
- [Cascading Configuration](#cascading-configuration)
    - [`@namespace` Directive](#namespace-directive)
    - [`@root` Directive](#root-directive)
- [Syntax](#syntax)
    - [Settings](#settings)
    - [Fallbacks](#fallbacks)
    - [Casting](#casting)
- [Routes](#routes)
    - [Generic Routes](#generic-routes)
    - [Computed Routes](#computed-routes)
- [`import`](#import)
- [Bundlers](#bundlers)
    - [Rollup](#rollup)
- [Migration Notes](#migration-notes)

## Getting Started

#### Global Install

Install `wires` globally and use the `wires` command in lieu of `node`:

```
npm install -g wires
```

So, `node ...` becomes `wires ...`.

When a local installation of `wires` exists in your project, the global command will automatically defer to it. This lets you pin a specific version per project.

#### Local Install

If you don't want to install `wires` globally, use `npx`:

```
npx wires ...
```

#### Using `node` Directly

If you don't want to use the `wires` command, you can use the `node` executable as follows:

```
node --require=wires --loader=wires ...
```

This will enable both the CommonJS and ECMAScript module resolution overrides.

Alternatively, if you only need CommonJS support, you can manually require `wires` at the beginning of the entry file of your project and use `node` as usual:

```js
require("wires");

// rest of your code
```

## Cascading Configuration

`wires` uses four types of configuration files:

- `wires-defaults.json` contains default settings
- `wires-defaults.XXX.json` contains default settings specific to when the `WIRES_ENV` environment variable is set to `"XXX"`
- `wires.json` contains actual settings
- `wires.XXX.json` contains actual settings specific to when the `WIRES_ENV` environment variable is set to `"XXX"`

Actual configuration depends on the position of the file requiring it in the filesystem hierarchy. Each directory gets its own configuration, which is computed as follows:

1. start with an empty object
2. override with `wires-defaults.json` if it exists
3. if `WIRES_ENV` is set to `"XXX"`, override with `wires-defaults.XXX.json` if it exists
4. override with the configuration of the parent directory if it exists and if the `@root` directive isn't set to `true`
5. override with `wires.json` if it exists
6. if `WIRES_ENV` is set to `"XXX"`, override with `wires.XXX.json` if it exists

In practice, you'll rarely use all files at once. Typically, parts of your application will define default values in their respective directories while the main app will set actual settings in the root directory, as in the following example:

```json
// /app/wires.json

{
    "mysql": {
        "user": "root",
        "password": "{#>PASSWORD}",
        "database": "test3"
    }
}
```

```json
// /app/database/wires-defaults.json

{
    "mysql": {
        "host": "localhost",
        "port": 3306,
        "user": "",
        "password": ""
    }
}
```

```js
// /app/database/lib/someFile.js

require("#mysql.host") === "localhost";
require("#mysql.port") === 3306;
require("#mysql.user") === "root";
require("#mysql.password") === String(process.env.PASSWORD);
require("#mysql.database") === "test3";
```

### `@namespace` Directive

The `@namespace` directive lets a sub-directory see only a specific branch of the parent configuration. This is useful for self-contained sub-packages: the sub-package works with flat, unprefixed keys, while the parent configures it through a single namespaced block. The two sides never need to agree on key names.

Let's go back to the previous example:

```json
// /app/wires.json

{
    "mysql": {
        "user": "root",
        "password": "{#>PASSWORD}",
        "database": "test3"
    }
}
```

```json
// /app/database/wires-defaults.json

{
    "@namespace": "mysql",

    "host": "localhost",
    "port": 3306,
    "user": "",
    "password": ""
}
```

```js
// /app/database/lib/someFile.js

require("#host") === "localhost";
require("#port") === 3306;
require("#user") === "root";
require("#password") === String(process.env.PASSWORD);
require("#database") === "test3";
```

_Note that routes are impervious to namespaces._

### `@root` Directive

Sometimes you want to fully isolate a directory's configuration from its parents. Set the `@root` directive to `true` and `wires` will stop climbing any further up the file hierarchy.

```json
// /parent/wires.json

{
    "parentKey": "parent value",
    "childKey": "overridden value"
}
```

```json
// /parent/child/wires-defaults.json

{
    "@root": true,

    "childKey": "child value"
}
```

```js
// /parent/child/someFile.js

require("#parentKey") === undefined;
require("#childKey") === "child value";
```

## Syntax

The following table summarizes the prefixes `wires` recognizes in `require()` and `import` expressions:

| Prefix | Resolves to | Example |
|--------|-------------|---------|
| _(none)_ | Standard Node.js resolution | `require("fs")`, `require("./lib/util")` |
| `~/` | Relative to home directory | `require("~/.eslintrc.json")` |
| `>/` | Relative to current working directory | `require(">/logger.js")` |
| `#` | Configuration setting | `require("#server.db.host")` |
| `#>` | Environment variable | `require("#>PATH")` |
| `:` | Route-based module | `require(":cacheFactory")` |
| `{#...}` | Template interpolation | `require("./lib/{#vendor}/main.js")` |
| `::` | Bypass `wires` entirely | `require("::raw-path")` |

#### Safe Interpolation with `?`

Targeting `undefined` or `null` values in template expressions may yield undesirable `"undefined"` or `"null"` strings. If you replace the leading `#` with `?`, falsy values produce an empty string (`""`) instead:

- `"value is '{#undefinedValue}'"` yields `"value is 'undefined'"`
- `"value is '{?undefinedValue}'"` yields `"value is ''"`

This is especially handy for environment variables that may or may not be set. While `"{#>UNSET_VAR}"` would yield `"undefined"`, `"{?>UNSET_VAR}"` yields `""`. This feature works hand in hand with [Fallbacks](#fallbacks).

#### Escaping Braces

`{` and `}` are special characters. You can escape them when they're needed verbatim:

- the expression `"{ placeholder }"` throws an exception
- the expression `"\\{ placeholder \\}"` yields `"{ placeholder }"`

### Settings

In your configuration files, every object property whose name is not prefixed with a colon is a setting.

A setting can be of any type, including an object. When the value of a setting is a string, it accepts the template syntax seen in the previous section.

```json
// /app/wires.json

{
    "number": 56,
    "boolean": false,
    "string": "some string",
    "templateString": "number is {#number}",
    "array": [1, 2],
    "object": {
        "templateString": "boolean is {#boolean}"
    },
    "env": "{?>SOME_VAR}"
}
```

```js
// /app/file.js

require("#number") === 56;
require("#string") === "some string";
require("#templateString") === "number is 56";
require("#array"); // [1, 2]
require("#object.templateString") === "boolean is false";
require("#env") === (process.env.SOME_VAR || "");
```

### Fallbacks

Every object property whose name ends with a question mark in your configuration files is a fallback. Fallbacks provide a default value for settings that are _empty_ (`""`, `NaN`, `null` or `undefined`).

Consider the following situation:

```json
// /app/wires.json

{
    "mysql_user": "{?>SQL_USER}"
}
```

```json
// /app/mysql/wires-defaults.json

{
    "mysql_user": "root"
}
```

```js
// /app/mysql/index.js

require("#mysql_user") === (process.env.SQL_USER || "");
```

The environment variable `SQL_USER` may not be set, and so the setting `mysql_user` may end up as an empty string. Yet it is still _set_, and the default value defined in `wires-defaults.json` will never be used.

This is easily solved with a fallback:

```json
// /app/wires.json

{
    "mysql_user": "{?>SQL_USER}"
}
```

```json
// /app/mysql/wires-defaults.json

{
    "mysql_user?": "root"
}
```

```js
// /app/mysql/index.js

require("#mysql_user") === (process.env.SQL_USER || "root");
```

Fallbacks act like any other setting and can be overridden through cascading configuration. They can also be retrieved programmatically when needed. Within object settings, they work the same way — they simply disappear when you require the object in its entirety:

```json
// /app/wires.json

{
    "mysql": {
        "user": "{?>SQL_USER}"
    }
}
```

```json
// /app/mysql/wires-defaults.json

{
    "mysql": {
        "user?": "root"
    }
}
```

```js
// /app/mysql/index.js

require("#mysql.user") === (process.env.SQL_USER || "root");
require("#mysql.user?") === "root";
assert.deepEqual(
    require("#mysql"),
    {
        "user": process.env.SQL_USER || "root"
    }
);
```

### Casting

String values in configuration files can be cast to booleans or numbers, or parsed as JSON.

#### Booleans and Numbers

```json
// wires.json

{
    "bool": "(boolean) true",
    "number": "(number) 1204"
}
```

```js
// file.js

require("#bool") === true;
require("#number") === 1204;
```

This is especially useful when dealing with environment variables:

```json
// wires.json

{
    "size": "(number){?>SIZE}"
}
```

```js
// file.js

const size = (process.env.SIZE || "").trim();
require("#size") === (size ? Number(size) : NaN);
```

Casting follows these rules:

- For booleans (cast using `(bool)` or `(boolean)`):
    - `"true"` becomes `true`,
    - `"false"` becomes `false`,
    - any other string becomes `null`.
- For numbers (cast using `(num)` or `(number)`), any string that cannot be parsed as a number will result in `NaN`.

Whitespace inside and around the parentheses is ignored, so `"(bool)true"`, `"( bool ) true"`, etc., are all equivalent.

#### JSON

String values can also be parsed as JSON using the `(json)` cast:

```json
// wires.json

{
    "json": "(json) \\{ \"property\": [ 1024 ] \\}"
}
```

```js
// file.js

require("#json.property")[0] === 1024;
```

This makes it possible to inject complex data structures from environment variables:

```json
// wires.json

{
    "json": "(json) {?>JSON}"
}
```

```js
// file.js

// if env var JSON === '{ "property": [ 1024 ] }'
require("#json.property")[0] === 1024;
```

If the string is not valid JSON, `null` is returned, allowing the use of a [fallback](#fallbacks):

```json
// wires.json

{
    "jsonWithoutFallback": "(json) not proper json",
    "jsonWithFallback": "(json) not proper json",
    "jsonWithFallback?": 712
}
```

```js
// file.js

require("#jsonWithoutFallback") === null;
require("#jsonWithFallback") === 712;
```

## Routes

In your configuration files, every object property whose name starts with a colon and does not end with a slash defines a route.

Routes must be strings. Like settings, they accept the template syntax. The final string must be a path to a file that actually exists.

File paths may refer to a file:

- globally (relying on `NODE_PATH`)
- relative to the directory of the configuration file (start with `"./"` or `"../"`)
- relative to the home directory (start with `"~/"`)
- relative to the current working directory (start with `">/"`)

```json
// /app/wires.json

{
    ":dbRequest": "mysql/request",
    ":cacheFactory": "../cache/factory",
    ":data": ">/data.json",
    ":eslint": "~/.eslintrc.json"
}
```

```js
// /app/some/path/inside/index.js

require(":dbRequest") === require("mysql/request");
require(":cacheFactory") === require("/cache/factory");
require(":data") === require("/working/dir/data.json");
require(":eslint") === require("/home/me/.eslintrc.json");
```

Any route (regular, generic, or computed) can be set to `null`. Requiring such a route will return `null`, which is useful for stubbing out modules that are not yet implemented.

```json
// /app/wires.json

{
    ":not-implemented-yet": null
}
```

```js
// /app/some/path/inside/index.js

require(":not-implemented-yet") === null;
```

### Generic Routes

In your configuration files, every object property whose name starts with a colon and ends with a slash defines a generic route.

Like normal routes, they must be strings and they accept the template syntax with the same path semantics (`NODE_PATH`, `"./"`, `"../"`, `"~/"`, `">/"` ). The property name acts as a prefix: `wires` replaces it with the route value and appends whatever follows.

```json
// /app/wires.json

{
    ":dbo/": "./db/model-"
}
```

```js
// /app/mvc/controllers/mainPage.js

require(":dbo/client") === require("/app/db/model-client");
require(":dbo/car/bmw") === require("/app/db/model-car/bmw");
```

### Computed Routes

When simple prefix replacement isn't enough, computed routes let you run custom resolution logic. A computed route key ends with `/()` and its value points to a CommonJS module exporting a function. `wires` calls that function with the path segments as arguments and uses the returned string as the resolved path.

Let's re-implement the generic route example from the previous section with a computed route:

```json
// /app/wires.json

{
    ":dbo/()": "./helpers/dbo.js"
}
```

```js
// /app/helpers/dbo.js

module.exports = (...pathSegments) => "../db/model-" + pathSegments.join("/");
```

```js
// /app/mvc/controllers/mainPage.js

require(":dbo/client") === require("/app/db/model-client");
require(":dbo/car/bmw") === require("/app/db/model-car/bmw");
```

Paths returned by the function are resolved relative to the location of the file where the function is defined. The function may also return `null` to stub out a route.

_Computed route functions must be defined in CommonJS modules. ECMAScript Modules are __not__ supported here._

## `import`

`wires` overrides both static and dynamic import statements, making it fully compatible with ES-module-based projects.

Unlike `require()`, `import` needs fully qualified paths with file extensions and does not resolve `index.js` when pointed at a directory. Make sure your routes include the full path:

```json
// /app/wires.json

{
    ":dir": "./dir/index.js"
}
```

```js
// /app/esm.js

import message from ":dir"; // works!
```

For reference, `require()` is more lenient and would also accept `"./dir"` or `"./dir/index"` as route values.

Additionally, for object values, `wires` creates a named export for every property whose name is a valid JavaScript identifier:

```json
// /app/wires.json

{
    "object": {
        "property1": 1,
        "property2": 2,
        "no name export": 3
    }
}
```

```js
// /app/esm.js
import object, { property1, property2 } from "#object";

object.property1 === 1;
object.property2 === 2;
object["no name export"] === 3;

property1 === 1;
property2 === 2;
```

## Bundlers

`wires` is designed to work with bundlers. The bundle does not need `wires` at runtime and does not include the core code of the package. Routes are resolved statically at bundle time, while values that depend on environment variables remain dynamic — `wires` adds a few short functions to the bundle to ensure they are read at runtime.

For instance, given the following situation:

```json
// /wires.json

{
    "server": {
        "keepAlive": "(number) {?>KEEP_ALIVE}",
        "keepAlive?": 60,
        "port": "(number) {?>PORT}",
        "port?": 8080
    }
}
```

```js
// /index.js

import { keepAlive, port } from "#server";

console.log(keepAlive, port);
```

then:
- `node index.js` will output `60 8080`
- `KEEP_ALIVE=30 PORT=80 node index.js` will output `30 80`

If `index.js` is bundled into `bundle.js`:
- `node bundle.js` will output `60 8080`
- `KEEP_ALIVE=30 PORT=80 node bundle.js` will output `30 80`

### Rollup

`wires` exposes a Rollup plugin at `wires/rollup` (it is part of the `wires` package itself).

Simply create a `rollup.config.js` [configuration file](https://www.rollupjs.org/guide/en/#configuration-files) and import the plugin:

```js
import wires from "wires/rollup";

export default {
    input: "src/index.js",
    output: {
        dir: "output",
        format: "es"
    },
    plugins: [wires()],
};
```

Then call `rollup` either via the [CLI](https://www.rollupjs.org/guide/en/#command-line-reference) or the [API](https://www.rollupjs.org/guide/en/#javascript-api).

The plugin is compatible with both [`@rollup/plugin-commonjs`](https://www.npmjs.com/package/@rollup/plugin-commonjs) and [`@rollup/plugin-node-resolve`](https://www.npmjs.com/package/@rollup/plugin-node-resolve), which makes it possible to bundle CommonJS projects, provided you set the former's `requireReturnsDefault` option to `true` and put the latter after the `wires` plugin in the list of plugins.

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
        commonjs({
            requireReturnsDefault: true
        })
    ]
};
```

## Migration Notes

If you are upgrading from an older version of `wires`, keep the following breaking changes in mind:

- **`3.0`**: `wires` uses `WIRES_ENV` instead of `NODE_ENV`. Adjust your environment configuration accordingly.
- **`4.0`**: Fallbacks now trigger only on _empty_ values (`""`, `NaN`, `null`, `undefined`). Previously, any _falsy_ value (`0`, `false`, etc.) would trigger a fallback.
- **`5.0`**: Using `node` directly now requires `--require=wires --loader=wires` (previously just `--require=wires`) to enable ESM support.

## License

© [Julian Aubourg](mailto:j@ubourg.net), 2012-2026 – licensed under the [MIT license][license-url].

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
