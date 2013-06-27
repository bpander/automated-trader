define([
    'jQuery',
    'views/View',
    'views/CandleView'
], function (
    $,
    View,
    CandleView
) {
    "use strict";

    var ChartView = function (model) {
        View.call(this, model);

        this.element = _constructElement();

        this.candleViews = [];

    };
    ChartView.prototype = new View();
    ChartView.prototype.constructor = ChartView;

    var _constructElement = function () {
        var element = document.createElement('table');
        element.className = 'chart chart_candle';

        var tr = document.createElement('tr');
        element.appendChild(tr);

        return element;
    };

    ChartView.prototype.render = function () {
        this.candleViews = [];
        var min = Number.MAX_VALUE;
        var max = 0;
        $.each(this.model.get('candles'), function (i, candle) {
            var candleView = new CandleView(candle).render();
            if (candle.get('highMid') > max) {
                max = candle.get('highMid');
            }
            if (candle.get('lowMid') < min) {
                min = candle.get('lowMid');
            }

            // TODO: Abstract this out
            this.candleViews.push(candleView);
            this.element.firstChild.appendChild(candleView.element);

        }.bind(this));

        var delta = max - min;
        $.each(this.candleViews, function (i, candleView) {
            var model = candleView.model;

            var candleDelta = model.get('closeMid') - model.get('openMid');
            candleView.candle.style.height = Math.abs(candleDelta) / delta * 100 + '%';

            var deltaFromMax = max - model.get('highMid');
            candleView.candle.style.top = deltaFromMax / delta * 100 + '%';
        });

        return this;
    };


    return ChartView;
});