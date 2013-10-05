var Ticker = require('./Ticker.js');
var fs = require('fs');

function StubTicker () {
    Ticker.call(this);
}
StubTicker.prototype = new Ticker();
StubTicker.prototype.constructor = StubTicker;

StubTicker.prototype.start = function () {

    var quotes = JSON.parse(fs.readFileSync('./public/json/historical.json'));
    var i = 0;
    var l = quotes.length;
    for (; i !== l; i++) {
        this.tick(quotes[i].prices[0]);
    }

};


module.exports = StubTicker;