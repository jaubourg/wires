[![NPM][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Dependency Status][dependency-image]][dependency-url]
[![devDependency Status][devDependency-image]][devDependency-url]
[![gratipay][gratipay-image]][gratipay-url]

# wires

A simple configuration utility for npm compatible platforms (node.js, io.js, etc) featuring smart module wiring for unobtrusive dependency injection.

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

## Getting started

1. Install wires globally: `npm -g install wires`
2. Use `wires` in lieu of `node` or `iojs`.
   For instance, `node --harmony path/to/myScript.js scriptArg` becomes `wires --harmony path/to/myScript.js scriptArg`.

## Cascading Configuration

wires uses 4 types of configuration file:

- `wires-defaults.json` contains default settings
- `wires-defaults.XXX.json` contains default settings specific to when the `NODE_ENV` environment variable is set to `"XXX"`
- `wires.json` contains actual settings
- `wires.XXX.json` contains default settings specific to when the `NODE_ENV` environment variable is set to `"XXX"`

Actual configuration depends on the position of the file requiring it in the filesystem hierarchy. Each directory gets its own configuration which is computed as follows:

1. start with an empty object
2. override with `wires-defaults.json` if it exists
3. if `NODE_ENV` is set to `"XXX"`, override with `wires-defaults.XXX.json` if it exists
4. override with the configuration of the parent directory if it exists
5. override with `wires.json` if it exists
6. if `NODE_ENV` is set to `"XXX"`, override with `wires.XXX.json` if it exists

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

Dropping a file called `wires-namespace.json` that contains a single string in a directory automatically creates a namespace. The namespace isolates the directory and limits its access to the part of the parent configuration defined within the namespace.

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

//root/database/wires-namespace.json

"mysql"

//root/database/wires-defaults.json

{
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
    + `require( "#>NODE_ENV" )`
- colon-lead, to inject route-based modules
    + `require( ":model/person.js" )`
    + `require( ":cacheFactory" )`
- templated, to construct paths dynamically
    + `require( "./lib/{#vendor}/main.js" )`
    + `require( "nodeunit/reporters/{#unit.reporter}" )`
- two-colons-lead, to bypass wires entirely
	+ `require( "::wires-will-not-transform-this" )`

## Settings

In your configuration files, every object property which name is not colon-lead is a setting.

A setting can be of any type, including an object. When the value of a setting is a string, it accepts the templated syntax seen in the previous section.

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
    "env": "{#>SOME_VAR}"
}

// file.js

require( "#number" ) === 56;
require( "#string" ) === "some string";
require( "#templateString" ) === "number is 56";
require( "#array" ); // [ 1, 2 ]
require( "#object.templateString" ) === "boolean is false";
require( "#env" ) === process.env.SOME_VAR;
```

## Routes

In your configuration files, every object property which name is colon-lead and does not end with a slash defines a route.

Routes can only be strings. Like settings, they accept the templated syntax. The final string must be a path to a file that actually exists.

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
	":jshint": "~/.jshint.json"
}

//directory/index.js

require( ":dbRequest" ) === require( "mysql/request" );
require( ":cacheFactory" ) === require( "/myApp/lib/util/cacheFactory" );
require( ":data" ) === require( "/current/working/directory/data.json" );
require( ":jshint" ) === require( "/path/to/home/directory/.jshint.json" );
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

require( ":dbo/client" ) ===  require( "/myApp/db/models/model-client" );
require( ":dbo/product" ) ===  require( "/myApp/db/models/model-product" );
```

## Command Line Definitions

It's possible to add definitions on-the-fly using command line arguments. wires regards any parenthesis-enclosed argument as such. Definitions are comma-separated assignments. For instance: `wires (path=80,debug=true) script.js` will set the `path` setting to 80 and the `debug` setting to true.

It's perfectly possible to define settings within objects using point-based paths, like `(path.to.my.setting=value)`.

If the value provided is not proper JSON, the value will be used as is `(setting=80)` will assign the integer `80` while `(setting=80s)` will assign the string `"80s"`. If you wish to force a value to be a string, just enclose it in simple or double quotes. For instance, `(setting='80')` will assign the string `"80"`.

Command line definitions respect cascading configurations. They will override any setting coming from the current working directory and its ancestors but will not override settings explicitly set (i.e, not in a `-defaults` file) in its children.

## License

Copyright (c) 2012 - 2015 [Julian Aubourg](mailto:j@ubourg.net)
Licensed under the [MIT license](https://raw.githubusercontent.com/jaubourg/wires/master/LICENSE-MIT).

[coveralls-image]: https://img.shields.io/coveralls/jaubourg/wires.svg
[coveralls-url]: https://coveralls.io/r/jaubourg/wires
[dependency-image]: https://david-dm.org/jaubourg/wires.svg
[dependency-url]: https://david-dm.org/jaubourg/wires
[devDependency-image]: https://david-dm.org/jaubourg/wires/dev-status.svg
[devDependency-url]: https://david-dm.org/jaubourg/wires#info=devDependencies
[gratipay-image]: https://img.shields.io/gratipay/jaubourg.svg
[gratipay-url]: https://gratipay.com/jaubourg/
[npm-image]: https://img.shields.io/npm/v/wires.svg
[npm-url]: https://npmjs.org/package/wires
[travis-image]: https://travis-ci.org/jaubourg/wires.svg
[travis-url]: https://travis-ci.org/jaubourg/wires
