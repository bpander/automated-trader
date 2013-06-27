define([
], function (
) {
    "use strict";

    var Chart = function () {

        this.candles = [];

    };

    Chart.prototype.addCandle = function (candle) {
        this.candles.push(candle);
        return this;
    };

    return Chart;
});