/* eslint-disable no-param-reassign */

"use strict";

const dirRoutes = require( `./dirRoutes` );
const setFieldDefault = require( `../util/setFieldDefault` );

module.exports = ( config, parent ) => {
    if ( !parent ) {
        return;
    }
    setFieldDefault( config, `_data`, parent.rawValue( config._namespace ) );
    setFieldDefault( config, `_routes`, parent._routes );
    config._dirRoutes = dirRoutes.merge( config._dirRoutes, parent._dirRoutes );
};
