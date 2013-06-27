define([
    'jQuery',
    'views/View'
], function (
    $,
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
        this.element.innerHTML = '&nbsp;'

        this.candle = document.createElement('div');
        this.candle.className = 'candle';
        this.element.appendChild(this.candle);

        this.wick = document.createElement('div');
        this.wick.className = 'candle-wick';
        this.element.appendChild(this.wick);
    };

    CandleView.prototype.render = function () {
        if (this.model.isBull()) {
            $(this.candle).removeClass('candle_bear').addClass('candle_bull');
            $(this.wick).removeClass('candle-wick_bear').addClass('candle-wick_bull');
        } else {
            $(this.candle).removeClass('candle_bull').addClass('candle_bear');
            $(this.wick).removeClass('candle-wick_bull').addClass('candle-wick_bear');
        }

        if (this.model.complete) {
            $(this.candle).removeClass('candle_dancing-bear');
        } else {
            $(this.candle).addClass('candle_dancing-bear');
        }

        return this;
    };


    return CandleView;
});