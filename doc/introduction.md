# A Quick Introduction to Wires

Wires uses node's require architecture as a means to distribute configuration information and inject dependencies. The main goal is to eliminate code which sole purpose is to move configuration around.

## The Problem

It's not unusual to have packages which code ends up looking like this:

```js
// main.js

    var cacheFactory = require( "./lib/cache" );
    var requesterFactory = require( "./lib/dbRequester" );

    module.exports = function( config ) {
        var cache = cacheFactory( config.storage || require( "./lib/default/storage" ) );
        var requester = requesterFactory( config.db || {} );

        return { /* ... */ };
    };

// lib/cache.js

    module.exports = function( storage ) {
        return { /* ... */ };
    };

// lib/dbRequester.js

    module.exports = function( dbConfig ) {
        var driver = new require( "./dbDriver" )( {
    	    hostname: dbConfig.hostname || "localhost",
    	    user: dbConfig.user || "",
    	    password: dbConfig.password || "",
    	    database: dbConfig.database
        } );

        return { /* ... */ };
    };
```

That's a lot of cruft just for enabling configuration. Of course, it's possible to handle default values much more elegantly but there's still the problem of every single module becoming a factory or a constructor for the sake of being configurable.

## The Solution

With wires, the code would look something like this:

```js
// wires-defaults.json

    {
        ":storage": "@/lib/default/storage",

        "db": {
            "hostname": "localhost",
            "user": "",
            "password": ""
        }
    }

// main.js

    var cache = require( "./lib/cache" );
    var requester = require( "./lib/dbRequester" );

    module.exports = { /* ... */ };

// lib/cache.js

    var storage = require( ":storage" );

    module.exports = { /* ... */ };

// lib/dbRequester.js

    var driver = new require( "./dbDriver" )( require( "#db" ) );

    module.exports = { /* ... */ };
```
