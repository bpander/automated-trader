var Ticker = require('./Ticker.js');
var Quote = require('../Quote.js');
var fs = require('fs');

function StubTicker () {
    Ticker.call(this);
}
StubTicker.prototype = new Ticker();
StubTicker.prototype.constructor = StubTicker;

StubTicker.prototype.start = function () {

    var quotes = JSON.parse(fs.readFileSync('./public/json/historical.json'));
    quotes.forEach(function (quote) {
        this.tick(new Quote().fromJSON(quote.prices[0]));
    }, this);

};


module.exports = StubTicker;