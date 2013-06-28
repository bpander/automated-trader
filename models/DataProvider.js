var request = require('request');
var fs = require('fs');
var Deferred = require('promised-io/promise').Deferred;


var DataProvider = {};

var _baseUrl = 'http://api-sandbox.oanda.com/v1/instruments/';

DataProvider.get = function (pair, params) {
    var dfd = new Deferred();
    // request({
    //     method: 'GET',
    //     url: _baseUrl + pair.toString() + '/candles',
    //     qs: params,
    //     json: true
    // }, function (error, response, body) {
    //     error ? dfd.reject(error) : dfd.resolve(body);
    // });
    
    fs.readFile('./public/json/USD_JPY.json', function (error, data) {
        error ? dfd.reject(error) : dfd.resolve(JSON.parse(data));
    });

    return dfd.promise;
};

module.exports = DataProvider;