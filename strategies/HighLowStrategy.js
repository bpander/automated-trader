var StrategyBase = require('./StrategyBase');
var Instrument = require('../models/Instrument');
var Graph = require('../models/Graph');
var Candle = require('../models/Candle');
var Q = require('Q');
var Util = require('../lib/Util');
var TimeKeeper = require('../lib/TimeKeeper');


function HighLowStrategy () {
    StrategyBase.call(this);

    this.instruments = [
        new Instrument('EUR', 'USD'),
        new Instrument('USD', 'JPY'),
        new Instrument('USD', 'CAD'),
        new Instrument('GBP', 'USD'),
        new Instrument('USD', 'CHF')
    ];

    this.graphs = {};

    this._onShortTermCandleClose = this._onShortTermCandleClose.bind(this);

}
HighLowStrategy.prototype = new StrategyBase();
HighLowStrategy.prototype.constructor = HighLowStrategy;


HighLowStrategy.SIGNAL = {
    RSI_MIN: 25,
    RSI_MAX: 75
};


HighLowStrategy.prototype.start = function () {
    return this.createGraphs();
};


HighLowStrategy.prototype.backTest = function (start, end) {
    var self = this;
    var fetchNewestCandle = function () {
        if (this.candles.length > this.maxLength) {
            this.candles.pop();
        }
        /* TODO: Get future data */
        // this.candles.unshift(new Candle().fromJSON(this.futureData.candles.shift()));
        this.trigger(Graph.EVENT.CANDLE_CLOSE);
    };
    StrategyBase.prototype.backTest.call(this);
    TimeKeeper.setVirtualTime(start.getTime());
    return this.createGraphs().then(function () {
        // Hijack the cronJob callbacks to they get the previously fetched data instead of calling the Oanda api
        var granularity;
        var instrumentString;
        var graph;
        for (granularity in self.graphs) {
            if (self.graphs.hasOwnProperty(granularity)) {
                for (instrumentString in self.graphs[granularity]) {
                    if (self.graphs[granularity].hasOwnProperty(instrumentString)) {
                        graph = self.graphs[granularity][instrumentString];
                        graph.futureData = [];
                        graph.cronJob._callbacks = [ fetchNewestCandle ];
                    }
                }
            }
        }
        TimeKeeper.simulateTime(start, end);
    });
};


/**
 * Tell each instrument in this Strategy to make short and long term graphs
 * 
 * @return {Q.Promise}  Resolves when all graphs are got
 */
HighLowStrategy.prototype.createGraphs = function () {
    var promises = this.instruments.map(function (instrument) {
        var graph_short = new Graph(instrument, Graph.GRANULARITY.S30);
        var graph_long = new Graph(instrument, Graph.GRANULARITY.D);

        // Listen for the short-term graph candle close event to analyze for open/close calls
        graph_short.on(Graph.EVENT.CANDLE_CLOSE, this._onShortTermCandleClose);

        // Save the created graphs to the Strategy instance
        this.graphs[Graph.GRANULARITY.S30] = this.graphs[Graph.GRANULARITY.S30] || {};
        this.graphs[Graph.GRANULARITY.S30][instrument.toString()] = graph_short;

        this.graphs[Graph.GRANULARITY.D] = this.graphs[Graph.GRANULARITY.D] || {};
        this.graphs[Graph.GRANULARITY.D][instrument.toString()] = graph_long;

        // Resolve when graph history is got
        return Q.all([
            graph_short.start(),
            graph_long.start()
        ]);
    }, this);

    return Q.all(promises);
};


HighLowStrategy.prototype._onShortTermCandleClose = function (e) {
    this.analyzeGraph(e.target);
};


/**
 * Analyze a Graph and use the data to place new orders or close existing
 * 
 * @param  {Graph}  graph  The Graph to analyze
 * @return {Object} Data describing any actions the analysis provoked
 */
HighLowStrategy.prototype.analyzeGraph = function (graph) {
    var candle = graph.candles[0];

    // Get graph analytics
    var rsi = graph.getRSI(14);
    var bb_short = graph.getBollingerBand(14, 1);
    var bb_long = graph.getBollingerBand(300, 1);
    var bb_longer = this.graphs[Graph.GRANULARITY.D][graph.instrument.toString()].getBollingerBand(300, 1);

    // Check for orders that need to be closed
    var order;
    var price;
    var doClose;
    var i = graph.instrument.orders.length;
    while (i--) {
        order = graph.instrument.orders[i];
        if (order.options.side === 'sell') {
            price = candle.closeAsk;
            doClose = rsi < 25 && price < order.response.price;
        } else {
            price = candle.closeBid;
            doClose = rsi > 75 && price > order.response.price;
        }
        if (doClose) {
            graph.instrument.close(order);
        }
    }

    // Check to see if we should make any more orders
    var units = Math.max(200, this.broker.balance * 0.1);
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
        graph.instrument.order(this.broker, {
            units: graph.instrument.base === 'USD' ? units : 1 / price * units,
            side: doSell ? 'sell' : 'buy',
            type: 'market'
        });
    }
};


module.exports = HighLowStrategy;
