var Q = require('Q');
var https = require('https');
var SETTINGS = require('../SETTINGS');
var extend = require('node.extend');


var OandaApi = {};

OandaApi.HOST = {
    PRACTICE: 'api-fxpractice.oanda.com',
    LIVE: ''
};

OandaApi.defaults = {
    hostname: SETTINGS.IS_TESTING ? OandaApi.HOST.PRACTICE : OandaApi.HOST.LIVE,
    headers: {
        Authorization: 'Bearer ' + SETTINGS.OANDA_API_TOKEN
    }
};


OandaApi.request = function (options) {
    var dfd = Q.defer();
    var data = '';
    var req = https.request(extend(true, OandaApi.defaults, options), function (res) {
        res.on('data', function (chunk) {
            data = data + chunk;
        });
        res.on('end', function () {
            var json;
            try {
                json = JSON.parse(data);
                dfd.resolve(json);
            } catch (e) {
                dfd.reject(e);
            }
        });
    });
    req.on('error', function (e) {
        dfd.reject(e);
    });
    req.end();
    return dfd.promise;
};


module.exports = OandaApi;
