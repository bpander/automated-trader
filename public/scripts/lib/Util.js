define([
], function (
) {
    "use strict";

    var Util = {};

    Util.MONTHS = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];

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

    Util.formatDate = function (date) {
        var hours = date.getHours();
        var hoursString = Util.pad(hours % 12 || 12);
        var minutesString = Util.pad(date.getMinutes());
        var meridian = hours < 12 ? 'am' : 'pm';
        var month = date.getMonth();
        return hoursString + ':' + minutesString + meridian + ' ' + date.getDate() + ' ' + Util.MONTHS[month].substr(0, 3);
    };

    Util.pad = function (number) {
        var str = number + '';
        if (str.length < 2) {
            str = '0' + str;
        }
        return str;
    };


    return Util;
});