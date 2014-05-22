'use strict';

var request = require('request');
var Q = require('Q');
var extend = require('node.extend');
var querystring = require('querystring');
var fs = require('fs');


var Oanda = {};


var _defaults = {
    url: 'https://api-fxpractice.oanda.com/v1/candles',
    headers: {
        Authorization: 'Bearer 84e920a42618757697162a9a051e5bcd-5a90c663914bf3839c7702a69579fa09'
    },
    qs: {}
};


Oanda.request = function (options) {
    console.log('Making Oanda API request...');
    options = extend(true, {}, _defaults, options);
    var dfd = Q.defer();
    var dir = 'history';
    var path = dir + '/' + querystring.stringify(options.qs);
    if (fs.existsSync(path)) {
        console.log('Found Oanda response in cache');
        dfd.resolve(JSON.parse(fs.readFileSync(path)));
    } else {
        request(options, function (error, response, body) {
            console.log('Got Oanda API response');
            var json;
            if (error) {
                dfd.reject(error);
            } else {
                json = JSON.parse(body);
                if (json.code !== undefined) {
                    dfd.reject(json);
                    return;
                }
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir);
                }
                fs.writeFile(path, body, function () {});
                dfd.resolve(json);
            }
        });
    }

    return dfd.promise;
};


module.exports = Oanda;
