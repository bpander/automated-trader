define([
    'models/Model'
], function (
    Model
) {
    "use strict";

    var Candle = function () {
        Model.call(this);

        this._properties.time = 0;

        this._properties.highMid = 0;

        this._properties.lowMid = 0;

        this._properties.openMid = 0;

        this._properties.closeMid = 0;

        this._properties.complete = false;

    };
    Candle.prototype = new Model();
    Candle.prototype.constructor = Candle;

    return Candle;
});