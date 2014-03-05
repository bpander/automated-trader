var StrategyBase = require('./StrategyBase');
var Instrument = require('../models/Instrument');
var InstrumentCollection = require('../models/InstrumentCollection');
var Graph = require('../models/Graph');
var Order = require('../models/Order');
var Q = require('Q');


function HighLowStrategy () {
    StrategyBase.call(this);

    this.instrumentCollection = new InstrumentCollection([
        new Instrument('EUR', 'USD'),
        new Instrument('USD', 'JPY'),
        new Instrument('USD', 'CAD')
    ]);

    this.orders = [];

    this.graphs = {};

    this._onCandleClose = this._onCandleClose.bind(this);

}
HighLowStrategy.prototype = new StrategyBase();
HighLowStrategy.prototype.constructor = HighLowStrategy;


HighLowStrategy.SIGNAL = {
    RSI_MIN: 25,
    RSI_MAX: 75
};


HighLowStrategy.prototype.start = function (startDate) {
    var startDate = startDate instanceof Date ? startDate : new Date();
    console.log('Strategy started at', startDate);

    // Tell each instrument to make day and minute candle graphs
    var promises = this.instrumentCollection.models.map(function (instrument) {
        // Create short- and long-term graph instances
        var graph_short = instrument.createGraph(Graph.GRANULARITY.M1, Graph.TYPE.CANDLE_STICK);
        var graph_long = instrument.createGraph(Graph.GRANULARITY.D, Graph.TYPE.CANDLE_STICK);
        graph_short.on(Graph.TYPE.CANDLE_STICK.EVENT.CANDLE_CLOSE, this._onCandleClose);

        // Save the created graphs to the Strategy instance
        this.graphs[Graph.GRANULARITY.M1] = this.graphs[Graph.GRANULARITY.M1] || {};
        this.graphs[Graph.GRANULARITY.M1][instrument.toString()] = graph_short;
        this.graphs[Graph.GRANULARITY.D] = this.graphs[Graph.GRANULARITY.D] || {};
        this.graphs[Graph.GRANULARITY.D][instrument.toString()] = graph_long;

        // Resolve when graph history is got
        return Q.all([
            graph_short.getHistory(null, startDate),
            graph_long.getHistory(null, startDate)
        ]);
    }, this);

    return Q.all(promises);
};


HighLowStrategy.prototype._onCandleClose = function (e) {
    var graph = e.target;
    var candle = e.data;

    // Get data analytics
    var rsi = graph.getRSI(14);
    var bb_short = graph.getBollingerBand(14, 1);
    var bb_long = graph.getBollingerBand(300, 1);
    var bb_longer = this.graphs[Graph.GRANULARITY.D][graph.instrument.toString()].getBollingerBand(300, 1);

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
            order.close();
            this.orders.splice(this.orders.indexOf(order), 1);
        }
    }

    // Check to see if we should make any more orders
    var units = Math.max(100, this.broker.balance * 0.1);
    if (this.broker.balance < units) {
        units = this.broker.balance;
        if (units < 20) {
            return;
        }
    }
    var doSell = rsi > HighLowStrategy.SIGNAL.RSI_MAX &&
        candle.closeBid > bb_longer.lowerAsk &&
        candle.closeBid > bb_short.upperBid &&
        candle.closeBid > bb_long.meanBid;
    var doBuy = rsi < HighLowStrategy.SIGNAL.RSI_MIN &&
        candle.closeAsk < bb_longer.upperBid &&
        candle.closeAsk < bb_short.lowerAsk &&
        candle.closeAsk < bb_long.meanAsk;

    // Sell or buy
    if (doSell || doBuy) {
        price = doSell ? candle.closeBid : candle.closeAsk;
        order = new Order(this.broker, {
            instrument: graph.instrument,
            units: graph.instrument.base === 'USD' ? units : 1 / price * units,
            side: doSell ? 'sell' : 'buy',
            type: 'market'
        });
        order.send();
        this.orders.push(order);
    }
};


module.exports = HighLowStrategy;
