var StrategyBase = require('./StrategyBase');
var Instrument = require('../models/Instrument');
var InstrumentCollection = require('../models/InstrumentCollection');
var Graph = require('../models/Graph');


function HighLowStrategy () {
    StrategyBase.call(this);

    this.instrumentCollection = new InstrumentCollection([
        new Instrument('EUR', 'USD')
    ]);

    this._onCandleClose = this._onCandleClose.bind(this);

}
HighLowStrategy.prototype = new StrategyBase();
HighLowStrategy.prototype.constructor = HighLowStrategy;


HighLowStrategy.SIGNAL = {
    RSI_MIN: 0.25,
    RSI_MAX: 0.75
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
    var graph = e.target;
    var candle = e.data;
    var rsi = graph.getRSI(14);
    var bb_short = graph.getBollingerBand(14, 1);
    var bb_long = graph.getBollingerBand(300, 1);
    var doSell = (true || rsi > HighLowStrategy.SIGNAL.RSI_MAX) &&
        candle.closeBid > bb_short.upperBid &&
        candle.closeBid > bb_long.meanBid;
    var doBuy = (true || rsi < HighLowStrategy.SIGNAL.RSI_MIN) &&
        candle.closeAsk < bb_short.lowerAsk &&
        candle.closeAsk < bb_long.meanAsk;

    if (doSell) {
        this.trigger(StrategyBase.EVENT.SIGNAL, {
            instrument: graph.instrument.toString(),
            units: 100,
            side: 'sell',
            type: 'market'
        });
    } else if (doBuy) {
        this.trigger(StrategyBase.EVENT.SIGNAL, {
            instrument: graph.instrument.toString(),
            units: 100,
            side: 'buy',
            type: 'market'
        });
    }
};


module.exports = HighLowStrategy;
