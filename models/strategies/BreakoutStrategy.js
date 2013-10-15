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

    if (this.currentCandle === null) {
        this.currentCandle = new Candle();
        this.currentCandle.start = quote.time;
        this.currentCandle.open = quote.ask;
        this.currentCandle.low = quote.ask;
        this.currentCandle.high = quote.ask;
        this.candleCheckTime = quote.time + this.candleDuration;
    } else {

        if (quote.ask > this.currentCandle.high) {
            this.currentCandle.high = quote.ask;
        } else if (quote.ask < this.currentCandle.low) {
            this.currentCandle.low = quote.ask;
        }

    }

    // We're still on the same candle
    if (quote.time < this.candleCheckTime) {
        return;
    }

    // The previous candle is finished. Close it out and start a new candle.
    this.currentCandle.close = quote.ask;
    this.currentCandle.stop = quote.time;

    if (this.currentCandle.isInside(this.run.slice(-1)[0])) {
        this.run.push(this.currentCandle);
        this.order({
            instrument: quote.instrument,
            time:       new Date(quote.time).toISOString(), // Dev purposes only, this gets set server-side
            units:      10,
            expiry:     new Date(quote.time + 1000 * 60 * 60 * 4).toISOString(),
            price:      quote.ask - 0.001,
            side:       'buy',
            type:       'stop',
            stopLoss:   quote.ask,
            takeProfit: Math.min(this.run[0].open, this.run[0].close) - 0.01
        });
    } else {
        this.run = [ this.currentCandle ];
    }

    this.currentCandle = null;
};


module.exports = BreakoutStrategy;