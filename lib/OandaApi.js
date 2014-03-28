var Q = require('Q');
var SETTINGS = require('../SETTINGS');
var extend = require('node.extend');
var request = require('request');


var OandaApi = {};


OandaApi.BASE_URL = {
    PRACTICE: 'https://api-fxpractice.oanda.com',
    LIVE: ''
};

OandaApi.REQUEST_DEFAULTS = {
    headers: {
        Authorization: 'Bearer ' + SETTINGS.OANDA_API_TOKEN
    },
    json: true
};


OandaApi.request = function (options) {
    var dfd = Q.defer();
    options = extend(true, OandaApi.REQUEST_DEFAULTS, options);
    options.url = (SETTINGS.IS_TESTING ? OandaApi.BASE_URL.PRACTICE : OandaApi.BASE_URL.LIVE) + options.path;
    delete options.path;

    request(options, function (error, response, body) {
        error ? dfd.reject(error) : dfd.resolve(body);
    });

    return dfd.promise;
};


module.exports = OandaApi;
