var Eventable = require('../lib/Eventable');
var Candle = require('./Candle');
var OandaApi = require('../lib/OandaApi');
var querystring = require('querystring');
var Util = require('../lib/Util');
var TimeKeeper = require('../lib/TimeKeeper');
var fs = require('fs');
var Q = require('Q');

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
    return this.fetchHistory({ end: new Date(TimeKeeper.now()).toISOString() }).then(function (res) {
        Util.log('Got', self.instrument.toString(), self.granularity, 'graph history');
        self.candles = [];
        res.candles.forEach(function (candle) {
            self.candles.unshift(new Candle().fromJSON(candle));
        });
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
    }).then(function (res) {
        if (self.candles.length > self.maxLength) {
            self.candles.pop();
        }
        self.candles.unshift(new Candle().fromJSON(res.candles[0]));
        self.trigger(Graph.EVENT.CANDLE_CLOSE);
    });
};


Graph.prototype.fetchHistory = function (options) {
    options = options || {};
    options.instrument = this.instrument.toString();
    options.granularity = this.granularity;
    var dfd = Q.defer();
    var history;
    var queryString = querystring.stringify(options);
    var filePath = 'history/' + queryString + '.json';
    if (fs.existsSync(filePath)) {
        history = fs.readFileSync(filePath);
        dfd.resolve(JSON.parse(history));
        return dfd.promise;
    }
    OandaApi.request({
        path: '/v1/history?' + queryString,
        method: 'GET'
    }).then(function (res) {
        fs.writeFileSync(filePath, JSON.stringify(res));
        dfd.resolve(res);
    });
    return dfd.promise;
};


Graph.prototype.getRSI = function (period) {
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
