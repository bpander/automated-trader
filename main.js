'use strict';

var Oanda = require('./Oanda');


var EMA = function (numbers) {
    numbers = numbers.slice(0);
    var ema = numbers.shift();
    var weight = 0.25;
    numbers.forEach(function (number) {
        ema = weight * number + (1 - weight) * ema;
    });
    return ema;
};


var extractClose = function (candle) {
    return candle.closeMid;
};

var MACD = function (candles, fast, slow, signal) {
    var macdSeries = [];
    var i = slow;
    candles.slice(slow).forEach(function (candle) {
        var emaFast = EMA(candles.slice(i - fast, i).map(extractClose));
        var emaSlow = EMA(candles.slice(i - slow, i).map(extractClose));
        var lines = {
            time: candle.time,
            macd: emaFast - emaSlow,
            signal: undefined,
            candle: candle
        };
        macdSeries.push(lines);
        i++;
    });

    i = signal;
    macdSeries.slice(signal).forEach(function (lines) {
        lines.signal = EMA(macdSeries.slice(i - signal, i).map(function (lines) {
            return lines.macd;
        }));
        i++;
    });
    return macdSeries;
};

var SMA = function (candles, period) {
    var sample;
    var i = period;
    var l = candles.length;
    for (; i !== l; i++) {
        sample = candles.slice(i - period, i);
        candles[i].sma = sample.reduce(function (previous, current) {
            return previous + current.closeMid;
        }, 0) / sample.length;
    }
};


Oanda.getCandles('EUR_USD', 'M5', new Date('01 Jan 2013'), new Date('21 May 2014')).then(function (candles) {
    var pips = 0;
    var macdSeries = MACD(candles, 12, 26, 9);
    var linesPrevious = macdSeries[0];
    var orders = [];
    var balance = 1000;
    var units = 250;
    SMA(candles, 200);
    macdSeries.forEach(function (lines) {
        if (lines.candle.sma === undefined) {
            return;
        }

        var isNeutral = lines.macd === 0;
        if (isNeutral) {
            return;
            linesPrevious = lines;
        }

        var isBelowCenter = lines.macd < 0;
        if (isBelowCenter) {
            var wasBear = linesPrevious.macd < linesPrevious.signal;
            var isBull = lines.macd > lines.signal;
            if (wasBear && isBull) {
                orders.forEach(function (order) {
                    if (order.side === 'sell' && order.close === undefined && order.open > lines.candle.closeMid) {
                        order.close = lines.candle.closeMid;
                        var delta = (order.open - order.close) * units;
                        pips = pips + delta;
                        balance = balance + delta + order.open * units;
                    }
                });
                var cost = lines.candle.closeMid * units;
                if (balance >= cost && lines.candle.sma > lines.candle.closeMid) {
                    var order = { side: 'buy', open: lines.candle.closeMid, close: undefined };
                    orders.push(order);
                    balance = balance - cost;
                }
            }

        } else {
            var wasBull = linesPrevious.macd > linesPrevious.signal;
            var isBear = lines.macd < lines.signal;
            if (wasBull && isBear) {
                orders.forEach(function (order) {
                    if (order.side === 'buy' && order.close === undefined && order.open < lines.candle.closeMid) {
                        order.close = lines.candle.closeMid;
                        var delta = (order.close - order.open) * units;
                        pips = pips + delta;
                        balance = balance + delta + order.open * units;
                    }
                });
                var cost = lines.candle.closeMid * units;
                if (balance >= cost && lines.candle.sma > lines.candle.closeMid) {
                    var order = { side: 'sell', open: lines.candle.closeMid, close: undefined };
                    orders.push(order);
                    balance = balance - cost;
                }
            }
        }
        linesPrevious = lines;
    });


    var ordersOpen = [];
    var heldUpFunds = 0;
    orders.forEach(function (order) {
        if (order.close === undefined) {
            ordersOpen.push(order);
            heldUpFunds = heldUpFunds + order.open * units;
        }
    });
    var numOrdersClosed = orders.length - ordersOpen.length;
    console.log('candle range:', candles[0].time, '-', candles[candles.length - 1].time);
    console.log('open:', ordersOpen);
    console.log('balance:', balance);
    console.log('heldUpFunds:', heldUpFunds);
    console.log('net:', balance + heldUpFunds);
    console.log('orders closed:', numOrdersClosed);
    console.log('P/L:', pips);
}, function (error) {
    console.error('ERROR', error);
});
