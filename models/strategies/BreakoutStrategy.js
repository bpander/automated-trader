var Strategy = require('./Strategy.js');
var request = require('request');

var BreakoutStrategy = function() {
    Strategy.call(this);

    this.friendlyName = 'Breakout';

};
BreakoutStrategy.prototype = new Strategy();
BreakoutStrategy.prototype.constructor = BreakoutStrategy;

BreakoutStrategy.prototype.start = function () {
    console.log('BreakoutStrategy start');
    request({
        method: 'GET',
        url: 'http://api-sandbox.oanda.com/v1/instruments/EUR_USD/candles',
        qs: {
            count: 2,
            granularity: 'H12'
        },
        json: true
    }, function (error, response, body) {
        console.log('request', typeof body);
    });
};

BreakoutStrategy.prototype.tick = function (data) {
    console.log('BreakoutStrategy tick', data);
};

module.exports = BreakoutStrategy;