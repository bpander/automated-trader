var Ticker = require('./Ticker.js');
var fs = require('fs');

function StubTicker () {
    Ticker.call(this);
}
StubTicker.prototype = new Ticker();
StubTicker.prototype.constructor = StubTicker;

StubTicker.prototype.start = function () {

    var stubData = JSON.parse(fs.readFileSync('./public/json/USD_JPY.json'));
    var i = 0;
    var l = stubData.candles.length;

    var timeoutId = setInterval(function () {

        this.tick(stubData.candles[i]);
        i++;
        if (i === l) {
            clearTimeout(timeoutId);
        }

    }.bind(this), 500);

};


module.exports = StubTicker;