var Q = require('Q');
var https = require('https');
var SETTINGS = require('../SETTINGS');
var extend = require('node.extend');
var querystring = require('querystring');


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
    var dataString = '';
    var data = querystring.stringify(options.data);
    delete options.data;
    var isPostingData = data && options.method === 'POST';
    var requestOptions = extend(true, OandaApi.defaults, options);

    if (isPostingData) {
        requestOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        requestOptions.headers['Content-Length'] = data.length;
    }
    var req = https.request(requestOptions, function (res) {
        res.on('data', function (chunk) {
            dataString = dataString + chunk;
        });
        res.on('end', function () {
            var json;
            try {
                json = JSON.parse(dataString);
                dfd.resolve(json);
            } catch (e) {
                dfd.reject(e);
            }
        });
    });
    req.on('error', function (e) {
        dfd.reject(e);
    });
    if (isPostingData) {
        req.write(data);
    }
    req.end();
    return dfd.promise;
};


module.exports = OandaApi;
