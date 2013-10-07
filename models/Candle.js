function Candle () {

    this.start = 0;

    this.stop = 0;

    this.open = 0.000;

    this.close = 0.000;

    this.low = 0.000;

    this.high = 0.000;

}

Candle.prototype.isInside = function (candle) {
    return candle instanceof Candle ? this.low > candle.low && this.high < candle.high : false;
};

module.exports = Candle;