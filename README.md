# wires

[![NPM Version][npm-image]][npm-url]
[![Node Version][node-image]][node-url]
[![License][license-image]][license-url]

[![Dependencies Status][dependency-image]][dependency-url]
[![devDependencies Status][devDependency-image]][devDependency-url]
[![Greenkeeper Status][greenkeeper-image]][greenkeeper-url]

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Code Style][codestyle-image]][codestyle-url]

[![Code quality][quality-image]][quality-url]

A simple configuration utility for npm compatible platforms (mainly node.js) featuring smart module wiring for unobtrusive dependency injection.

## Overview

wires augments the filename resolution mechanisms used by `require()` under the hood as a means to transparently inject configuration into your code.

```js
require( "#port" ); // <= gets the http port of the server
require( ":db_driver" ); // <= gets the module that will serve as database driver
require( ":models/user" ); // <= gets the model definition for a user
require( ":models/article" ); // <= gets the model definition for an article
```

Hash-lead expressions are used to recover settings. Colon-lead expressions are used to leverage routes and inject modules.

Routes and settings are defined in JSON files:

```js
// the following JSON

{
    "port": 80,
    ":db_driver": "mysql/driver",
    ":models/": "./app/db/models/model-"
}

// will yield the following results

require( "#port" ) === 80;
require( ":db_driver" ) === require( "mysql/driver" );
require( ":models/user" ) === require ( "/path/to/config/app/db/models/model-user" );
require( ":models/article" ) === require ( "/path/to/config/app/db/models/model-article" )

// this alternate JSON

{
    "port": 8080,
    ":db_driver": "./lib/dbDriver",
    ":models/": "myAppDataModel/dbo/"
}

// will yield the following results

require( "#port" ) === 8080;
require( ":db_driver" ) === require( "/path/to/config/lib/dbDriver" );
require( ":models/user" ) === require ( "myAppDataModel/dbo/user" );
require( ":models/article" ) === require ( "myAppDataModel/dbo/article" )
```

Not that settings which keys are at-sign-lead are considered as directives and will not appear in your configuration. Currently supported directives are `@namespace` and `@root`.

## Getting started

Typically,

1. install wires globally: `npm -g install wires`
2. use `wires` in lieu of `node`.

So, `node --harmony path/to/myScript.js scriptArg`
becomes `wires --harmony path/to/myScript.js scriptArg`.

As of version 0.4.0, `wires` will look for local installations based on the current working directory. This means you can add wires as a dependency to your project and have this specific version take precedence whenever the global command is ran from within said project.

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

This behavior is compatible with version 0.2.0 and up.

Alternatively, if you cannot, or don't want to, use the command, you may simply require wires in your main source file. Note that you only need to require it once for the entire code base.

## Cascading Configuration

wires uses 4 types of configuration file:

- `wires-defaults.json` contains default settings
- `wires-defaults.XXX.json` contains default settings specific to when the `WIRES_ENV` environment variable is set to `"XXX"`
- `wires.json` contains actual settings
- `wires.XXX.json` contains default settings specific to when the `WIRES_ENV` environment variable is set to `"XXX"`

__Prior to version 3.0, wires did use the `NODE_ENV` environment variable rather than `WIRES_ENV`. Please adjust your projects accordingly when upgrading to 3.0 and higher.__

Actual configuration depends on the position of the file requiring it in the filesystem hierarchy. Each directory gets its own configuration which is computed as follows:

1. start with an empty object
2. override with `wires-defaults.json` if it exists
3. if `WIRES_ENV` is set to `"XXX"`, override with `wires-defaults.XXX.json` if it exists
4. override with the configuration of the parent directory if it exists and if the `@root` directive isn't set to `true`
5. override with `wires.json` if it exists
6. if `WIRES_ENV` is set to `"XXX"`, override with `wires.XXX.json` if it exists

In practice, you'll rarely use all files at once. Typically, parts of your application will define default values in their respective directories while the main app will set actual settings in the root directory, as in the following example:

```js
//root/wires.json

{
    "mysql": {
        "user": "root",
        "password": "never-put-your-password-in-a-doc--ever",
        "database": "test3"
    }
}

//root/database/wires-defaults.json

{
    "mysql": {
        "host": "localhost",
        "port": 3306,
        "user": "",
        "password": ""
    }
}

//root/database/lib/someFile.js

require( "#mysql.host" ) === "localhost";
require( "#mysql.port" ) === 3306,
require( "#mysql.user" ) === "root",
require( "#mysql.password" ) === "never-put-your-password-in-a-doc--ever",
require( "#mysql.database" ) === "test3"
```

## Namespace

Adding in one of your configuration files the directive `@namespace` which value is a string creates a namespace. The namespace isolates the directory and limits its access to the part of the parent configuration defined within said namespace.

Let's go back to the previous example:

```js
//root/wires.json

{
    "mysql": {
        "user": "root",
        "password": "never-put-your-password-in-a-doc--ever",
        "database": "test3"
    }
}

//root/database/wires-defaults.json

{
    "@namespace": "mysql",

    "host": "localhost",
    "port": 3306,
    "user": "",
    "password": ""
}

//root/database/lib/someFile.js

require( "#host" ) === "localhost";
require( "#port" ) === 3306,
require( "#user" ) === "root",
require( "#password" ) === "never-put-your-password-in-a-doc--ever",
require( "#database" ) === "test3"
```

Note that routes are impervious to namespaces.

## Root Directive

Sometimes, it is desirable to isolate your configuration: just set the `@root` directive to true and wires will stop climbing any further up the file hierarchy.

See the following example:

```js
//parent/wires.json

{
    "parentKey": "parent value",
    "childKey": "overidden value"
}

//parent/child/wires-defaults.json

{
    "@root": true,

    "childKey": "child value"
}

//parent/child/someFile.js

require( "#parentKey" ) === undefined;
require( "#childKey" ) === "child value";
```

## Require Syntax

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
- two-colons-lead, to bypass wires entirely
	+ `require( "::wires-will-not-transform-this" )`

Targeting `undefined` or `null` values in expressions may yield potentially undesirable `"undefined"` or `"null"` in the resulting string. If and when you change the leading `#` to a leading `?` and the targeted value is "falsy" (`undefined`, `null`, `false`, etc...), then the result is an empty string (`""`). For instance:

- the expression `"value={#undefinedValue}"` yields `"value=undefined"`
- the expression `"value={?undefinedValue}"` yields `"value="`

This is especially handy for environment variables that may or may not be set. While `"#>UNSET_VAR"` would yield `"undefined"`, `?>UNSET_VAR` yields `""`.

## Settings

In your configuration files, every object property which name is not colon-lead is a setting.

A setting can be of any type, including an object. When the value of a setting is a string, it accepts the template syntax seen in the previous section.

```js
// wires.json

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

// file.js

require( "#number" ) === 56;
require( "#string" ) === "some string";
require( "#templateString" ) === "number is 56";
require( "#array" ); // [ 1, 2 ]
require( "#object.templateString" ) === "boolean is false";
require( "#env" ) === ( process.env.SOME_VAR || "" );
```

## Fallbacks

As of version 2, every object property which name ends with a question mark in your configuration files is a fallback. Fallbacks are useful in situations where a setting may be _falsy_ (`false`, `""`, `0`, `null`, etc) yet you still need a default value for it.

Let's take the following situation as an example:

```js
//myApp/wires.json

{
    "mysql_user": "{?>SQL_USER}"
}

//myApp/mysql/wires-defaults.json

{
    "mysql_user": "root"
}

//myApp/mysql/index.js

require( "#mysql_user" ) === ( process.env.SQL_USER || "" );
```

The environment variable `SQL_USER` may not be set and so the setting `mysql_user` may end up as an empty string. Yet, it is still _set_ and the default value defined in `wires-defaults.json` will never be used.

The problem can easily be worked around using a fallback:

```js
//myApp/wires.json

{
    "mysql_user": "{?>SQL_USER}"
}

//myApp/mysql/wires-defaults.json

{
    "mysql_user?": "root"
}

//myApp/mysql/index.js

require( "#mysql_user" ) === ( process.env.SQL_USER || "root" );
```

Fallbacks act like any other setting and can be overridden using the cascading nature of configurations. They can also be recovered programmatically if and when needed.

Coming back to the previous example, if we redefine the fallback in the parent configuration then this new setting will be used in place of `root` as the "fallback value":

```js
//myApp/wires.json

{
    "mysql_user": "{?>SQL_USER}",
    "mysql_user?": "admin"
}

//myApp/mysql/wires-defaults.json

{
    "mysql_user?": "root"
}

//myApp/mysql/index.js

require( "#mysql_user" ) === ( process.env.SQL_USER || "admin" );
require( "#mysql_user?" ) === "admin";
```

Fallbacks also work within settings that are objects themselves. They just disappear when you require the object in its entirety:

```js
//myApp/wires.json

{
    "mysql": {
        "user": "{?>SQL_USER}"
    }
}

//myApp/mysql/wires-defaults.json

{
    "mysql": {
        "user?": "root"
    }
}

//myApp/mysql/index.js

require( "#mysql.user" ) === ( process.env.SQL_USER || "root" );
require( "#mysql.user?" ) === "root";
assert.deepEqual(
    require( "#mysql" ),
    {
        "user": process.env.SQL_USER || "root"
    }
);
```

## Routes

In your configuration files, every object property which name is colon-lead and does not end with a slash defines a route.

Routes must be strings. Like settings, they do accept the template syntax. The final string must be a path to a file that actually exists.

File paths may refer to a file:

- globally (relying on `NODE_PATH`)
- relatively to the directory of the configuration file (starts with `"./"` or `"../"`)
- relatively to the home directory (starts with `"~/"`)
- relatively to the current working directory (starts with `">/"`)

```js
//myApp/wires.json

{
	":dbRequest": "mysql/request",
	":cacheFactory": "./lib/util/cacheFactory",
	":data": ">/data.json"
	":eslint": "~/.eslintrc.json"
}

//myApp/some/path/inside/index.js

require( ":dbRequest" ) === require( "mysql/request" );
require( ":cacheFactory" ) === require( "/myApp/lib/util/cacheFactory" );
require( ":data" ) === require( "/current/working/directory/data.json" );
require( ":eslint" ) === require( "/path/to/home/directory/.eslintrc.json" );
```

As of version 2.1, it is possible to set a route to `null` : requiring such a route would result in `null`.

```js
//myApp/wires.json

{
	":not-implemented-yet": null
}

//myApp/some/path/inside/index.js

require( ":not-implemented-yet" ) === null;
```

## Generic Routes

In your configuration files, every object property which name is colon-lead and ends with a slash defines a generic route.

Like normal routes, they must be strings, they do accept the templated syntax and they have the same semantics (`NODE_PATH`, `"./"`, `"../"`, `"~/"`, `">/"` ). However, they may not point to the path of an existing file since the final string will be used as a replacement for the property name in require expressions.

```js
//myApp/wires.json

{
    ":dbo/": "./db/models/model-",
}

//myApp/mvc/controllers/mainPage.js

require( ":dbo/client" ) === require( "/myApp/db/models/model-client" );
require( ":dbo/product/electronics" ) === require( "/myApp/db/models/model-product/electronics" );
```

As of version 2.1, it is possible to set a route to `null` : requiring such a route and it's children would result in `null`.

```js
//myApp/wires.json

{
    ":to-do/": null,
}

//myApp/mvc/controllers/mainPage.js

require( ":to-do/child" ) === null;
require( ":to-do/other/path" ) === null;
```

## Computed Routes

As of version 2.1, in your configuration files, every object property which name is colon-lead and ends with a slash followed by an opening then a closing parenthesis defines a computed route.

They are very similar to generic routes except there is no automatic concatenation performed by wires. Rather, the value must be a string pointing to a module that exports a function. This function will be called by wires with the path segments as arguments and is expected to return the resulting path.

This sounds quite complicated but let's re-implement the generic route example from the previous section with a computed route:

```js
//myApp/wires.json

{
    ":dbo/()": "./helpers/dbo.js",
}

//myApp/helpers/dbo.js

module.exports = ( ...pathSegments ) => "../db/models/model-" + pathSegments.join( `/` );

//myApp/mvc/controllers/mainPage.js

require( ":dbo/client" ) === require( "/myApp/db/models/model-client" );
require( ":dbo/product/electronics" ) === require( "/myApp/db/models/model-product/electronics" );
```

Please note that paths returned by the function are resolved relatively to the location of the file where the function is defined.

It is possible for a computed route function to return `null` : requiring such a route and it's children would result in `null`.

```js
//myApp/wires.json

{
    ":dbo/()": "./helpers/dbo.js",
}

//myApp/helpers/dbo.js

module.exports = () => null; // not implemented yet

//myApp/mvc/controllers/mainPage.js

require( ":dbo/client" ) === null;
require( ":dbo/product" ) === null;
```

## Command Line Definitions

It's possible to add definitions on-the-fly using command line arguments. wires regards any parenthesis-enclosed argument as such. Definitions are comma-separated assignments. For instance: `wires (path=80,debug=true) script.js` will set the `path` setting to `80` and the `debug` setting to `true`.

It's perfectly possible to define settings within objects using point-based paths, like `(path.to.my.setting=value)`.

If the value provided is not proper JSON, the value will be used as is `(setting=80)` will assign the integer `80` while `(setting=80s)` will assign the string `"80s"`. If you wish to force a value to be a string, just enclose it in simple or double quotes. For instance, `(setting='80')` will assign the string `"80"`.

Command line definitions respect cascading configurations. They will override any setting coming from the current working directory and its ancestors but will not override settings explicitly set (i.e, not in a `-defaults` file) in its children.

## License

Copyright (c) 2012 - 2018 [Julian Aubourg](mailto:j@ubourg.net)
Licensed under the [MIT license][license-url].

[codestyle-image]: https://img.shields.io/badge/code%20style-creative--area-brightgreen.svg?style=flat-square
[codestyle-url]: https://github.com/creative-area/eslint-config
[coveralls-image]: https://img.shields.io/coveralls/jaubourg/wires.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/jaubourg/wires
[dependency-image]: https://img.shields.io/david/jaubourg/wires.svg?style=flat-square
[dependency-url]: https://david-dm.org/jaubourg/wires
[devDependency-image]: https://img.shields.io/david/dev/jaubourg/wires.svg?style=flat-square
[devDependency-url]: https://david-dm.org/jaubourg/wires?type=dev
[greenkeeper-image]: https://badges.greenkeeper.io/jaubourg/wires.svg
[greenkeeper-url]: https://greenkeeper.io/
[license-image]: https://img.shields.io/npm/l/wires.svg?style=flat-square
[license-url]: https://raw.githubusercontent.com/jaubourg/wires/master/LICENSE
[node-image]: https://img.shields.io/node/v/wires.svg?style=flat-square
[node-url]: https://npmjs.org/package/wires
[npm-image]: https://img.shields.io/npm/v/wires.svg?style=flat-square
[npm-url]: https://npmjs.org/package/wires
[quality-image]: https://img.shields.io/lgtm/grade/javascript/g/jaubourg/wires.svg?style=flat-square&logo=lgtm&logoWidth=18
[quality-url]: https://lgtm.com/projects/g/jaubourg/wires/context:javascript
[travis-image]: https://img.shields.io/travis/jaubourg/wires.svg?style=flat-square
[travis-url]: https://travis-ci.org/jaubourg/wires
