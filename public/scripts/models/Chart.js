define([
    'models/Model'
], function (
    Model
) {
    "use strict";

    var Chart = function () {
        Model.call(this);

        this._properties.candles = [];

    };
    Chart.prototype = new Model();
    Chart.prototype.constructor = Chart;

    Chart.prototype.addCandle = function (candle) {
        this.get('candles').push(candle);
        return this;
    };

    return Chart;
});