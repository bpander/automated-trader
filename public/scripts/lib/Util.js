define([
], function (
) {
    "use strict";

    var Util = {};

    Util.bindAll = function (methodObject, thisArg) {
        var boundMethods = {};
        var methodName;
        for (methodName in methodObject) {
            if (methodObject[methodName] instanceof Function) {
                boundMethods[methodName] = methodObject[methodName].bind(thisArg);
            }
        }
        return boundMethods;
    };

    Util.noop = function () {};


    return Util;
});