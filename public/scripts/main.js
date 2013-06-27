require([
    'jQuery',
    'models/Candle',
    'models/Chart',
    'views/ChartView'
], function (
    $,
    Candle,
    Chart,
    ChartView
) {
    "use strict";

    $(function () {

        var stubData = {"instrument":"EUR_USD","granularity":"D","candles":[{"time":1371934800,"openMid":1.31211,"highMid":1.31425,"lowMid":1.30867,"closeMid":1.30920,"complete":"true"},{"time":1372021200,"openMid":1.30920,"highMid":1.31441,"lowMid":1.30592,"closeMid":1.31197,"complete":"true"},{"time":1372107600,"openMid":1.31197,"highMid":1.31508,"lowMid":1.30651,"closeMid":1.30784,"complete":"true"},{"time":1372194000,"openMid":1.30785,"highMid":1.31649,"lowMid":1.29849,"closeMid":1.30117,"complete":"true"},{"time":1372280400,"openMid":1.30117,"highMid":1.30170,"lowMid":1.30051,"closeMid":1.30160,"complete":"false"}]};

        var chart = new Chart();
        var chartView = new ChartView(chart);

        $.each(stubData.candles, function (i, candleData) {
            var candle = new Candle().set(candleData);
            chart.addCandle(candle);
        });

        document.body.innerHTML = '';
        document.body.appendChild(chartView.render().element);



        // $.get('http://api-sandbox.oanda.com/v1/instruments/EUR_USD/candles?count=2&granularity=D');

    });

});