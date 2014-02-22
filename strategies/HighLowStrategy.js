var StrategyBase = require('./StrategyBase');
var BollingerBand = require('../tools/BollingerBand');
var RelativeStrengthIndex = require('../tools/RelativeStrengthIndex');


function HighLowStrategy () {
    StrategyBase.call(this);

    this.instrumentCollection = new instrumentCollection([
        new Instrument('EUR', 'USD'),
        new Instrument('USD', 'JPY')
    ]);

}
HighLowStrategy.prototype = new StrategyBase();
HighLowStrategy.prototype.constructor = HighLowStrategy;


HighLowStrategy.SIGNAL {
    RSI_MIN: 0.25,
    RSI_MAX: 0.75
};


HighLowStrategy.prototype.start = function () {
    this.instrumentCollection.on('Ticker:candleClose:M1', this._onTickerCandleCloseM1);
};


HighLowStrategy.prototype.backTest = function () {

};


HighLowStrategy.prototype._onCandleCloseM1 = function (e) {
    var instrument = e.target;
    var candle = e.data;
    var rsi = instrument.getRSI(14);
    var bb_short = instrument.getBollingerBand(200, 2);
    var bb_long = instrument.getBollingerBand(200, 2);
    var doSell = HighLowStrategy.SIGNAL.RSI_MIN > rsi &&
        candle.close > bb_short.upper &&
        candle.close > bb_short.upper;
    var doBuy = HighLowStrategy.SIGNAL.RSI_MAX < rsi &&
        candle.close < bb_short.lower &&
        candle.close < bb_short.lower;

};


module.exports = HighLowStrategy;
