var StrategyBase = require('./StrategyBase');
var Instrument = require('../models/Instrument');
var InstrumentCollection = require('../models/InstrumentCollection');
var Graph = require('../models/Graph');
var Order = require('../models/Order');


function HighLowStrategy () {
    StrategyBase.call(this);

    this.instrumentCollection = new InstrumentCollection([
        new Instrument('USD', 'JPY')
    ]);

    this.orders = [];

    this.minimumBalance = 99;

    this._onCandleClose = this._onCandleClose.bind(this);

}
HighLowStrategy.prototype = new StrategyBase();
HighLowStrategy.prototype.constructor = HighLowStrategy;


HighLowStrategy.SIGNAL = {
    RSI_MIN: 25,
    RSI_MAX: 75
};


HighLowStrategy.prototype.start = function () {

    // Tell the instruments to make 1 minute candles
    this.instrumentCollection.models.forEach(function (instrument) {
        var graph = instrument.createGraph(1000 * 60, Graph.TYPE.CANDLE_STICK);
        graph.on(Graph.TYPE.CANDLE_STICK.EVENT.CANDLE_CLOSE, this._onCandleClose);
    }, this);

    return this;
};


HighLowStrategy.prototype._onCandleClose = function (e) {
    var self = this;
    var graph = e.target;
    var candle = e.data;

    // Get data analytics
    var rsi = graph.getRSI(14);
    var bb_short = graph.getBollingerBand(14, 1);
    var bb_long = graph.getBollingerBand(300, 1);

    // Check for orders that need to be closed
    var order;
    var price;
    var doClose;
    var i = this.orders.length;
    while (i--) {
        order = this.orders[i];
        if (order.options.side === 'sell') {
            price = graph.instrument.ask;
            doClose = rsi < 25 && price < order.response.price;
        } else {
            price = graph.instrument.bid;
            doClose = rsi > 75 && price > order.response.price;
        }
        if (doClose) {
            order.close().then(function () {
                self.orders.splice(self.orders.indexOf(order), 1);
            });
        }
    }

    // Check to see if we should make any more orders
    if (this.broker.balance <= this.minimumBalance) {
        return;
    }
    var doSell = rsi > HighLowStrategy.SIGNAL.RSI_MAX &&
        candle.closeBid > bb_short.upperBid &&
        candle.closeBid > bb_long.meanBid;
    var doBuy = rsi < HighLowStrategy.SIGNAL.RSI_MIN &&
        candle.closeAsk < bb_short.lowerAsk &&
        candle.closeAsk < bb_long.meanAsk;

    // Sell or buy
    var units = 100;
    if (doSell || doBuy) {
        price = doSell ? candle.closeBid : candle.closeAsk;
        order = new Order(this.broker, {
            instrument: graph.instrument,
            units: graph.instrument.base === 'USD' ? units : 1 / price * units,
            side: doSell ? 'sell' : 'buy',
            type: 'market'
        });
        order.send().then(function () {
            self.orders.push(order);
        });
    }
};


module.exports = HighLowStrategy;
