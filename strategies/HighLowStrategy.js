var StrategyBase = require('./StrategyBase');
var Instrument = require('../models/Instrument');
var Graph = require('../models/Graph');
var Candle = require('../models/Candle');
var Q = require('Q');
var Util = require('../lib/Util');
var TimeKeeper = require('../lib/TimeKeeper');
var mysql = require('mysql');
var SETTINGS = require('../SETTINGS');


function HighLowStrategy () {
    StrategyBase.call(this);

    this.instruments = [
        new Instrument('USD', 'JPY')
    ];

    this.graphs = {};

    this._onShortTermCandleClose = this._onShortTermCandleClose.bind(this);

}
HighLowStrategy.prototype = new StrategyBase();
HighLowStrategy.prototype.constructor = HighLowStrategy;


HighLowStrategy.SIGNAL = {
    OPEN: {
        RSI_MIN: 20,
        RSI_MAX: 80
    },
    CLOSE: {
        RSI_MIN: 25,
        RSI_MAX: 75
    }
};


HighLowStrategy.prototype.start = function () {
    var self = this;
    return StrategyBase.prototype.start.call(this).then(function () {
        return self.createGraphs();
    });
};


HighLowStrategy.prototype.backTest = function (start, end) {
    var self = this;
    var connection = mysql.createConnection(SETTINGS.MYSQL);
    var fetchNewestCandle = function () {
        var newestCandle = this.futureCandles[0];
        if (newestCandle === undefined || TimeKeeper.now() !== new Date(newestCandle.time).getTime()) {
            return;
        }
        if (this.candles.length > this.maxLength) {
            this.candles.pop();
        }
        this.candles.unshift(new Candle().fromJSON(this.futureCandles.shift()));
        this.instrument.bid = this.candles[0].closeBid;
        this.instrument.ask = this.candles[0].closeAsk;
        this.trigger(Graph.EVENT.CANDLE_CLOSE);
    };
    StrategyBase.prototype.backTest.call(this);
    TimeKeeper.setVirtualTime(start.getTime());
    return this.createGraphs()
        .then(function (graphCollection) {
            // Hijack the cronJob callbacks so they get the previously fetched data instead of calling the Oanda api
            return Q.all(graphCollection.map(function (graphs) {
                return Q.all(graphs.map(function (graph) {
                    graph.cronJob._callbacks = [ fetchNewestCandle ];
                    graph.futureCandles = [];
                    Util.log('Getting', graph.instrument.toString(), graph.granularity, 'future candles');
                    var getfutureCandles = function () {
                        var dfd = Q.defer();
                        var query = 'SELECT * FROM ' + graph.instrument.toString() + '_' + graph.granularity + ' WHERE time >= "' + start.toISOString() + '" AND time <= "' + end.toISOString() + '" ORDER BY time ASC';
                        connection.query(query, function (error, rows) {
                            if (error) {
                                dfd.reject(error);
                                return;
                            }
                            Util.log('Got', graph.instrument.toString(), graph.granularity, 'future candles');
                            graph.futureCandles = rows;
                            dfd.resolve();
                        });
                        return dfd.promise;
                    };
                    return getfutureCandles();
                }));
            }));
        })
        .then(function () {
            connection.destroy();
            Util.log('Simulating time', start, 'to', end);
            TimeKeeper.simulateTime(start, end);
            Util.log('Simulating time complete');
        }, function (error) {
            Util.error('Error:', error);
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
 */
HighLowStrategy.prototype.analyzeGraph = function (graph) {
    var candle = graph.candles[0];

    // Get graph analytics
    var rsi = graph.getRSI(14);
    var bb_short = graph.getBollingerBand(14, 1);
    var bb_longer = this.graphs[Graph.GRANULARITY.D][graph.instrument.toString()].getBollingerBand(300, 1);
    Util.log('Analyzing graph...');
    Util.log({
        'candle.closeBid': candle.closeBid,
        'rsi': rsi,
        'bb_short.meanBid': bb_short.meanBid,
        'bb_longer.meanBid': bb_longer.meanBid
    });

    // Check for orders that need to be closed
    var order;
    var price;
    var doClose;
    var i = graph.instrument.orders.length;
    while (i--) {
        order = graph.instrument.orders[i];
        if (order.options.side === 'sell') {
            price = candle.closeAsk;
            doClose = rsi < HighLowStrategy.SIGNAL.CLOSE.RSI_MIN && price < order.price;
        } else {
            price = candle.closeBid;
            doClose = rsi > HighLowStrategy.SIGNAL.CLOSE.RSI_MAX && price > order.price;
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

    var doSell = rsi > HighLowStrategy.SIGNAL.OPEN.RSI_MAX &&
        candle.closeBid > bb_longer.meanBid &&
        candle.closeBid > bb_short.upperBid;
    var doBuy = rsi < HighLowStrategy.SIGNAL.OPEN.RSI_MIN &&
        candle.closeAsk < bb_longer.meanAsk &&
        candle.closeAsk < bb_short.lowerAsk;

    // Sell or buy
    if (doSell || doBuy) {
        price = doSell ? candle.closeBid : candle.closeAsk;
        units = graph.instrument.base === 'USD' ? units : 1 / price * units;
        units = Math.floor(units);
        while (graph.instrument.orders.some(function (order) {
            return order.options.units === units;
        })) {
            units = units - 1;
        }
        graph.instrument.order(this.broker, {
            units: units,
            side: doSell ? 'sell' : 'buy',
            type: 'market'
        });
    }
};


module.exports = HighLowStrategy;
