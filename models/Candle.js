function Candle () {

    this.time = 0;

    this.open = 0.000;

    this.close = 0.000;

    this.low = Infinity;

    this.high = 0.000;

}


Candle.prototype.fromArray = function (array) {
    this.time = new Date(array[0] + ' ' + array[1]).getTime();
    this.open = 1 / array[2];
    this.high = 1 / array[3];
    this.low = 1 / array[4];
    this.close = 1 / array[5];
    return this;
};


Candle.prototype.isInside = function (candle) {
    return candle instanceof Candle ? this.low > candle.low && this.high < candle.high : false;
};


module.exports = Candle;