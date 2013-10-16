var Strategy = require('./Strategy.js');
var Candle = require('../Candle.js');

function BreakoutStrategy () {
    Strategy.call(this);

    this.friendlyName = 'Breakout Strategy';

    this.run = [];

    this.currentCandle = null;

    this.candleCheckTime = 0;

    this.candleDuration = 1000;

};
BreakoutStrategy.prototype = new Strategy();
BreakoutStrategy.prototype.constructor = BreakoutStrategy;

BreakoutStrategy.prototype.tick = function (quote) {
    this.lastTick = quote;

    if (quote.ask > 90.1735 - 0.01) {
        this.run.push(this.currentCandle);
        this.order({
            instrument: quote.instrument,
            time:       new Date(quote.time).toISOString(), // Dev purposes only, this gets set server-side
            units:      this.getBalance() * 0.333333,
            expiry:     new Date(quote.time + 1000 * 60 * 4).getTime(), //.toISOString(),
            price:      quote.ask - 0.001,
            side:      'buy',
            type:      'stop',
            stopLoss:   quote.ask,
            takeProfit: 87.9945 + 0.01
        });
    }

};


module.exports = BreakoutStrategy;