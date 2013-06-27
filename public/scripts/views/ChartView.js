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
        $.each(this.model.candles, function (i, candle) {
            var candleView = new CandleView(candle).render();
            if (candle.highMid > max) {
                max = candle.highMid;
            }
            if (candle.lowMid < min) {
                min = candle.lowMid;
            }

            // TODO: Abstract this out
            this.candleViews.push(candleView);
            this.element.firstChild.appendChild(candleView.element);

        }.bind(this));

        var delta = max - min;
        $.each(this.candleViews, function (i, candleView) {
            var model = candleView.model;

            var candleDelta = model.closeMid - model.openMid;
            candleView.candle.style.height = Math.abs(candleDelta) / delta * 100 + '%';

            var candleTop = Math.max(model.openMid, model.closeMid);
            var deltaTopFromMax = max - candleTop;
            candleView.candle.style.top = deltaTopFromMax / delta * 100 + '%';

            var wickDelta = model.highMid - model.lowMid;
            candleView.wick.style.height = wickDelta / delta * 100 + '%';

            var deltaWickFromMax = max - model.highMid;
            candleView.wick.style.top = deltaWickFromMax / delta * 100 + '%';

        });

        return this;
    };


    return ChartView;
});