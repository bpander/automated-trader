var Eventable = require('../lib/Eventable');
var Candle = require('./Candle');
var OandaApi = require('../lib/OandaApi');
var querystring = require('querystring');


var Graph = {};


Graph.TYPE = {
    CANDLE_STICK: CandleStickGraph
};

Graph.GRANULARITY = {
    M1: 'M1',
    D: 'D'
};

Graph.INTERVAL = {
    M1: 1000 * 60,
    D: 1000 * 60 * 60 * 24
};


Graph.create = function (instrument, granularity, type) {
    return new type(instrument, granularity);
};


function GraphBase (instrument, granularity) {
    Eventable.call(this);

    this.instrument = instrument;

    this.granularity = granularity;

};
GraphBase.prototype = new Eventable();
GraphBase.prototype.constructor = GraphBase;


GraphBase.prototype.addTick = function (tick) {};


function CandleStickGraph (instrument, granularity) {
    GraphBase.call(this, instrument, granularity);

    this.currentCandle = new Candle();

    this.candles = [];

    this.maxLength = 500;

}
CandleStickGraph.prototype = new GraphBase();
CandleStickGraph.prototype.constructor = CandleStickGraph;


CandleStickGraph.EVENT = {
    CANDLE_CLOSE: 'candleclose'
};


CandleStickGraph.prototype.addTick = function (tick) {
    var lastCandle;
    this.currentCandle.highBid = Math.max(this.currentCandle.highBid, tick.bid);
    this.currentCandle.highAsk = Math.max(this.currentCandle.highAsk, tick.ask);
    this.currentCandle.lowBid = Math.min(this.currentCandle.lowBid, tick.bid);
    this.currentCandle.lowAsk = Math.min(this.currentCandle.lowAsk, tick.ask);

    if (tick.timestamp > this.currentCandle.timestamp + Graph.INTERVAL[this.granularity]) {
        // Close out the current candle
        lastCandle = this.currentCandle;
        lastCandle.closeBid = tick.bid;
        lastCandle.closeAsk = tick.ask;

        // Start a new candle
        this.currentCandle = new Candle();
        this.currentCandle.timestamp = tick.timestamp;
        this.currentCandle.openBid = tick.bid;
        this.currentCandle.openAsk = tick.ask;
        this.currentCandle.highBid = tick.bid;
        this.currentCandle.highAsk = tick.ask;
        this.currentCandle.lowBid = tick.bid;
        this.currentCandle.lowAsk = tick.ask;

        if (lastCandle.openBid !== 0) {
            this.candles.unshift(lastCandle);
        }
        if (this.candles.length > this.maxLength) {
            this.candles.pop();
        }
        this.trigger(CandleStickGraph.EVENT.CANDLE_CLOSE, lastCandle);
    }
    return this;
};


CandleStickGraph.prototype.getHistory = function (start, end) {
    console.log('Getting', this.instrument.toString(), this.granularity, 'graph');
    var self = this;
    var parameters = {
        instrument: this.instrument.toString(),
        count: this.maxLength,
        granularity: this.granularity
    };
    if (start) {
        parameters.start = start.toISOString();
    }
    if (end) {
        parameters.end = end.toISOString();
    }
    return OandaApi.request({
        path: '/v1/history?' + querystring.stringify(parameters),
        method: 'GET'
    }).then(function (res) {
        self.candles = [];
        res.candles.forEach(function (candle) {
            self.candles.unshift(new Candle().fromJSON(candle));
        });
        console.log('Got', self.instrument.toString(), self.granularity, 'graph history');
    });
};


CandleStickGraph.prototype.getRSI = function (period) {
    var candles = this.candles.slice(0, period);
    var gain = 0;
    var loss = 0;
    candles.forEach(function (candle) {
        var delta = candle.closeBid - candle.openBid;
        if (delta > 0) {
            gain = gain + delta;
        } else {
            loss = loss - delta;
        }
    });
    var averageGain = gain / candles.length;
    var averageLoss = loss / candles.length;
    var RS = averageGain / averageLoss;
    return 100 - 100 / (1 + RS);
};


CandleStickGraph.prototype.getBollingerBand = function (period, standardDeviations) {
    var candles = this.candles.slice(0, period);
    standardDeviations = standardDeviations / 2;

    var meanBid = candles.reduce(function (previous, current) {
        return previous + current.closeBid;
    }, 0) / candles.length;
    var sigmaBid = Math.sqrt(candles.reduce(function (previous, current) {
        return previous + Math.pow(current.closeBid - meanBid, 2);
    }, 0) / meanBid);

    var meanAsk = candles.reduce(function (previous, current) {
        return previous + current.closeAsk;
    }, 0) / candles.length;
    var sigmaAsk = Math.sqrt(candles.reduce(function (previous, current) {
        return previous + Math.pow(current.closeAsk - meanAsk, 2);
    }, 0) / meanAsk);

    return {
        lowerBid: meanBid - sigmaBid * standardDeviations,
        lowerAsk: meanAsk - sigmaAsk * standardDeviations,
        meanBid: meanBid,
        meanAsk: meanAsk,
        upperBid: meanBid + sigmaBid * standardDeviations,
        upperAsk: meanAsk + sigmaAsk * standardDeviations
    };
};


module.exports = Graph;
