var http = require('http');
var fs = require('fs');
var querystring = require('querystring');
var Q = require('q');

var SETTINGS = {
    INSTRUMENT: process.argv[2] || 'USD_JPY',
    DAYS: parseInt(process.argv[3]) || 30
};

var _oandaCall = function (module, params, version) {
    version = version || 'v1';
    var baseUrl = 'http://api-sandbox.oanda.com';
    var dfd = Q.defer();
    var url = baseUrl + '/' + version + '/' + module + '?' + querystring.stringify(params);
    var data = '';

    http.get(url, function (response) {
        response.on('data', function (chunk) {
            data = data + chunk;
        });
        response.on('end', function () {
            dfd.resolve(JSON.parse(data));
        });
    });

    return dfd.promise;
};

var ticks = [];

var _accumulateData = function (start) {
    start = start || new Date(Date.now() - 1000 * 60 * 60 * 24 * SETTINGS.DAYS);
    var dfd = Q.defer();
    var params = {
        instrument:     SETTINGS.INSTRUMENT,
        candleFormat:   'bidask',
        granularity:    'S5',
        count:          5000,
        start:          start.toISOString(),
        includeFirst:   false
    };

    return _oandaCall('history', params).then(function (response) {

        if (response.candles.length === 0) {
            return;
        }

        response.candles.forEach(function (candle) {
            ticks.push({
                prices: [{
                    instrument: response.instrument,
                    time: candle.time,
                    bid: candle.openBid,
                    ask: candle.openAsk
                }]
            });
        });

        console.log('got', response.candles.length, 'at', start);

        var newStart = new Date(response.candles.slice(-1)[0].time);
        return _accumulateData(newStart);
    });
    return dfd.promise;
};

_accumulateData().then(function () {
    console.log('writing', ticks.length, 'ticks');
    fs.writeFileSync('public/json/historical.json', JSON.stringify(ticks, null, 2));
}, function () {
    console.log('error', arguments);
});
