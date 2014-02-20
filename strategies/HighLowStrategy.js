var StrategyBase = require('./StrategyBase');
var BollingerBand = require('../tools/BollingerBand');
var RelativeStrengthIndex = require('../tools/RelativeStrengthIndex');


function HighLowStrategy () {
    StrategyBase.call(this);

    this.tools = {

        bollingerBands: {
            short: new BollingerBand(14, 2),
            long:  new BollingerBand(200, 2)
        },

        rsi: new RelativeStrengthIndex(14)

    };

}
HighLowStrategy.prototype = new StrategyBase();
HighLowStrategy.prototype.constructor = HighLowStrategy;


HighLowStrategy.prototype.start = function () {
    this.on('Ticker:candleclose', this.onCandleClose);
};


HighLowStrategy.prototype.onCandleClose = function () {

};


module.exports = HighLowStrategy;
