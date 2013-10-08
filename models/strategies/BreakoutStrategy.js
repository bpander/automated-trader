var Strategy = require('./Strategy.js');
var Candle = require('../Candle.js');

function BreakoutStrategy () {
    Strategy.call(this);

    this.friendlyName = 'Breakout Strategy';

    this.run = [];

    this.currentCandle = null;

    this.candleCheckTime = 0;

    this.candleDuration = 1000 * 60 * 60 * 12;

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

BreakoutStrategy.prototype.test = function (data) {
    var dfd = new Deferred();
    var thisCandle;
    var previousCandle;
    var latestCandle = data[data.length - 1];
    var runLength = 0;
    var orders = [];
    var i = data.length;
    while (i-- !== 1) {
        thisCandle = data[i];
        previousCandle = data[i - 1];
        if (_isInsideCandle(thisCandle, previousCandle)) {
            runLength++; // A higher runLength means the breakout is more valid. Use this to calculate confidence
            orders.push({
                time: latestCandle.time,
                instrument: 'USD_JPY',
                expiry: latestCandle.time + 60 * 60 * 4,
                units: latestCandle.closeMid + 0.01,
                price: latestCandle.closeMid + 0.01,
                side: 'buy',
                stopLoss: latestCandle.closeMid,
                takeProfit: (thisCandle.highMid - latestCandle.closeMid) + latestCandle.closeMid
            });
            continue;
        }
        break;
    }
    if (orders.length === 0) {
        dfd.resolve({ balance: 0, openOrderValue: 0 });
        return dfd.promise;
    }
    var url = 'http://api-sandbox.oanda.com/v1/instruments/USD_JPY/candles?granularity=S5&start=' + orders[0].time + '&end=' + orders[0].expiry;
    var data = '';
    http.get(url, function (res) {
        res.on('data', function (chunk) {
            data = data + chunk;
        });
        res.on('end', function () {
            var balance = 0;
            var openOrders = orders.slice(0);
            var activeOrders = [];
            var json = JSON.parse(data);
            var candles = json.candles || [];
            var candle;
            var i = 0;
            var l = candles.length;
            var indexesToRemove = [];
            for (i; i !== l; i++) {
                candle = candles[i];

                indexesToRemove = [];
                activeOrders.forEach(function (order, i) {
                    if (candle.highMid >= order.takeProfit || candle.highMid <= order.stopLoss) {
                        indexesToRemove.push(i);
                        balance = balance + (1 / candle.highMid) * 100;
                    }
                });

                indexesToRemove.forEach(function (index) {
                    activeOrders.splice(index, 1);
                });

                indexesToRemove = [];
                openOrders.forEach(function (order, i) {
                    if (candle.highMid >= order.price) {
                        activeOrders.push(order);
                        indexesToRemove.push(i);
                        balance = balance - (1 / candle.highMid) * 100;
                    }
                });

                indexesToRemove.forEach(function (index) {
                    openOrders.splice(index, 1);
                });
            }
            var openOrderValue = 0;
            openOrders.forEach(function (openOrder) {
                openOrderValue = openOrderValue + 1 / openOrder.price;
            });
            dfd.resolve({ balance: balance, openOrderValue: openOrderValue });
        });
    });

    return dfd.promise;
};

module.exports = BreakoutStrategy;