var Strategy = require('./Strategy.js');
var Quote = require('../Quote.js');
var Candle = require('../Candle.js');

function BreakoutStrategy () {
    Strategy.call(this);

    this.friendlyName = 'Breakout Strategy';

    this.candleDuration = 1000 * 60 * 60 * 24;

    this.currentCandle = new Candle();

    this.candles = [];

    this.mean = {
        upper: 0.0000,
        lower: 0.0000
    };

    this.standardDeviation = {
        upper: 0,
        lower: 0
    };

    this.lastTick = null;

    this.minimumBalance = 1.0000;

};
BreakoutStrategy.prototype = new Strategy();
BreakoutStrategy.prototype.constructor = BreakoutStrategy;


BreakoutStrategy.prototype.tick = function (quote) {
    var self = this;
    this.lastTick = quote;
    if (quote.time > this.currentCandle.time + this.candleDuration) {

        // Close out current candle
        this.currentCandle.close = quote.ask;

        this.mean.upper = this.candles.reduce(function (previous, current) {
            return previous + current.high;
        }, 0) / this.candles.length;
        this.standardDeviation.upper = Math.sqrt(this.candles.reduce(function (previous, current) {
            return previous + Math.pow(current.high - self.mean.upper, 2);
        }, 0) / this.candles.length);

        this.mean.lower = this.candles.reduce(function (previous, current) {
            return previous + current.low;
        }, 0) / this.candles.length;
        this.standardDeviation.lower = Math.sqrt(this.candles.reduce(function (previous, current) {
            return previous + Math.pow(current.low - self.mean.lower, 2);
        }, 0) / this.candles.length);

        // Open new candle
        this.currentCandle = new Candle();
        this.currentCandle.time = quote.time;
        this.currentCandle.open = quote.ask;
        this.candles.push(this.currentCandle);
    }

    if (this.candles.length <= 5) {
        return;
    }

    this.currentCandle.high = Math.max(this.currentCandle.high, quote.ask);
    this.currentCandle.low = Math.min(this.currentCandle.low, quote.ask);
    var balance = this.getBalance();

    if (quote.ask > this.mean.upper - (this.standardDeviation.upper / 4) && balance > this.minimumBalance) {
        this.order({
            instrument: quote.instrument,
            time:       new Date(quote.time).toISOString(), // Dev purposes only, this gets set server-side
            units:      balance * 0.2,
            expiry:     new Date(quote.time + 1000 * 60 * 2).getTime(), //.toISOString(),
            price:      quote.ask - 0.0001,
            side:      'buy',
            type:      'stop',
            stopLoss:   0,
            takeProfit: this.mean.lower + (this.standardDeviation / 4)
        });
    }
};


module.exports = BreakoutStrategy;