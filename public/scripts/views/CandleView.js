define([
    'views/View'
], function (
    View
) {
    "use strict";

    var CandleView = function (model) {
        View.call(this, model);

        this.element = null;

        this.candle = null;

        this.wick = null;

        _constructElement.call(this);
    };
    CandleView.prototype = new View();
    CandleView.prototype.constructor = CandleView;

    var _constructElement = function () {
        this.element = document.createElement('td');

        this.candle = document.createElement('div');
        this.candle.className = 'candle candle_bear';
        this.element.appendChild(this.candle);

        this.wick = document.createElement('div');
        this.wick.className = 'candle-wick candle-wick_bear';
        this.candle.appendChild(this.wick);
    };

    CandleView.prototype.render = function () {
        // Add bear or bull classes here
        return this;
    };


    return CandleView;
});