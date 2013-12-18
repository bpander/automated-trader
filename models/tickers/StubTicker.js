var Ticker = require('./Ticker.js');
var Quote = require('../Quote.js');
var Pair = require('../pairs/Pair.js');
var q = require('q');

function StubTicker () {
    Ticker.call(this);
}
StubTicker.prototype = new Ticker();
StubTicker.prototype.constructor = StubTicker;

StubTicker.prototype.start = function () {
    Ticker.prototype.start.call(this);
    var self = this;
    var dfd = q.defer();
    var pair = new Pair('USD', 'JPY');
    pair.getHistoricalData().then(function (quotes) {
        quotes.forEach(function (quote) {
            self.tick(quote);
        });
        dfd.resolve();
    });

    return dfd.promise;
};


module.exports = StubTicker;