define([
    'jQuery',
    'lib/Util',
    'views/View',
    'views/CandleView'
], function (
    $,
    Util,
    View,
    CandleView
) {
    "use strict";

    var ChartView = function (model) {
        View.call(this, model);

        this.candleViews = [];

        this.chartHead = null;

        this.chartBody = null;

        this.chartFoot = null;

        _constructElement.call(this);

    };
    ChartView.prototype = new View();
    ChartView.prototype.constructor = ChartView;

    var _constructElement = function () {
        this.element = document.createElement('table');
        this.element.className = 'chart chart_candle';
        var thead = document.createElement('thead');
        var tfoot = document.createElement('tfoot');
        var tbody = document.createElement('tbody');
        this.element.appendChild(thead);
        this.element.appendChild(tbody);
        this.element.appendChild(tfoot);

        this.chartHead = document.createElement('th');
        this.chartHead.className = 'chart-head';

        this.chartFoot = document.createElement('tr');
        this.chartFoot.className = 'chart-times';

        this.chartBody = document.createElement('tr');

        thead.appendChild(this.chartHead);
        tfoot.appendChild(this.chartFoot);
        tbody.appendChild(this.chartBody);
    };

    ChartView.prototype.render = function () {
        this.chartHead.setAttribute('colspan', this.model.candles.length);
        this.chartHead.innerHTML = this.model.instrument.replace('_', ' &#10152; ');

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
            this.chartBody.appendChild(candleView.element);

            var timestampDate = new Date(candle.time * 1000);
            var timestamp = document.createElement('td');
            timestamp.innerHTML = Util.formatDate(timestampDate);
            this.chartFoot.appendChild(timestamp);

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