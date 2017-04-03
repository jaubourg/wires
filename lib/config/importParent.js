/* eslint-disable no-param-reassign */

"use strict";

const dirRoutes = require( `./dirRoutes` );
const setFieldDefault = require( `../util/setFieldDefault` );

module.exports = ( config, parent ) => {
    if ( !parent ) {
        return;
    }
    const namespace = config._namespace;
    setFieldDefault( config, `_data`, namespace ? parent._data[ namespace ] : parent._data );
    setFieldDefault( config, `_routes`, parent._routes );
    config._dirRoutes = dirRoutes.merge( config._dirRoutes, parent._dirRoutes );
};
