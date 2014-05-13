var Eventable = require('../lib/Eventable');
var Candle = require('./Candle');
var OandaApi = require('../lib/OandaApi');
var Util = require('../lib/Util');
var TimeKeeper = require('../lib/TimeKeeper');
var Q = require('q');

function Graph (instrument, granularity) {
    Eventable.call(this);

    this.instrument = instrument;

    this.granularity = granularity;

    this.candles = [];

    this.maxLength = 500;

    this.cronJob = TimeKeeper.createJob({
        cronTime: Graph.CRON_PATTERN[granularity],
        onTick:   this.fetchNewestCandle,
        context:  this
    });

}
Graph.prototype = new Eventable();
Graph.prototype.constructor = Graph;


Graph.GRANULARITY = {
    S5:     'S5',
    S15:    'S15',
    S30:    'S30',
    M1:     'M1',
    D:      'D'
};

Graph.INTERVAL = {
    S5:     1000 * 5,
    S15:    1000 * 15,
    S30:    1000 * 30,
    M1:     1000 * 60,
    D:      1000 * 60 * 60 * 24
};

Graph.CRON_PATTERN = {
    S5:     '*/5 * * * * *',
    S15:    '*/15 * * * * *',
    S30:    '*/30 * * * * *',
    M1:     '00 * * * * *',
    D:      '00 00 17 * * *'
};

Graph.EVENT = {
    CANDLE_CLOSE: 'candleclose'
};


/**
 * Get back-data and start monitoring for new candles
 * @return {Q.Promise}  
 */
Graph.prototype.start = function () {
    var self = this;
    Util.log('Getting', this.instrument.toString(), this.granularity, 'graph');
    return this.fetchHistory({ end: new Date(TimeKeeper.now()).toISOString() }).then(function (response) {
        Util.log('Got', self.instrument.toString(), self.granularity, 'graph history');
        self.candles = [];
        if (!response.candles.slice(-1)[0].complete) {
            Util.log('Removing last candle: incomplete candle');
            response.candles.pop();
        }
        response.candles.forEach(function (candle) {
            self.candles.unshift(new Candle().fromJSON(candle));
        });
        self.instrument.bid = self.candles[0].closeBid;
        self.instrument.ask = self.candles[0].closeAsk;
        self.cronJob.start();
        return self;
    });
};


Graph.prototype.stop = function () {
    this.cronJob.stop();
    return this;
};


Graph.prototype.fetchNewestCandle = function () {
    var self = this;
    this.fetchHistory({
        count: 1,
        end: new Date(TimeKeeper.now()).toISOString()
    }).then(function (response) {
        if (self.candles.length > self.maxLength) {
            self.candles.pop();
        }
        self.candles.unshift(new Candle().fromJSON(response.candles[0]));
        self.instrument.bid = response.candles[0].closeBid;
        self.instrument.ask = response.candles[0].closeAsk;
        self.trigger(Graph.EVENT.CANDLE_CLOSE);
    });
};


Graph.prototype.fetchHistory = function (options) {
    options = options || {};
    options.instrument = this.instrument.toString();
    options.granularity = this.granularity;
    var dfd = Q.defer();
    OandaApi.request({
        path: '/v1/candles',
        method: 'GET',
        qs: options
    }).then(function (response) {
        dfd.resolve(response);
    });
    return dfd.promise;
};


Graph.prototype.getRSI = function (period) {
    var getAverages = function (candles) {
        var movement = candles.reduce(function (previous, candle) {
            delta = candle.closeBid - candle.openBid;
            delta > 0 ? (previous.gain = previous.gain + delta) : (previous.loss = previous.loss - delta);
            return previous;
        }, { gain: 0, loss: 0 });
        return {
            gain: movement.gain / period,
            loss: movement.loss / period
        };
    };
    var sample = this.candles.slice(period, period * 2);
    var movingAverages = getAverages(sample);
    var averages = {};
    var i = 1;
    var l = period + 1;
    for (; i !== l; i++) {
        sample = this.candles.slice(period - i, period * 2 - i);
        averages = getAverages(sample);
        movingAverages.gain = (movingAverages.gain * (period - 1) + averages.gain) / period;
        movingAverages.loss = (movingAverages.loss * (period - 1) + averages.loss) / period;
    }

    var rs = movingAverages.gain / movingAverages.loss;

    return 100 - 100 / (1 + rs);
};


Graph.prototype.getBollingerBand = function (period, standardDeviations) {
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
