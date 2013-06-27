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

        // return;

        var _onDataGet = function (data) {
            var chart = new Chart();
            chart.instrument = data.instrument;
            var chartView = new ChartView(chart);
            $.each(data.candles, function (i, candleData) {
                var candle = new Candle().fromJSON(candleData);
                chart.addCandle(candle);
            });
            var container = document.createElement('div');
            container.style.width = '600px';
            container.style.height = '400px';
            container.style.margin = '10px auto';
            document.body.appendChild(container);
            container.appendChild(chartView.render().element);
        };

        var pairs = [
            'EUR_USD',
            'USD_JPY',
            'GBP_USD',
            'AUD_USD',
            'USD_CHF',
            'USD_CAD',
            'USD_HKD',
            'USD_SEK',
            'NZD_USD'
        ];

        var urlBase = 'http://api-sandbox.oanda.com/v1/instruments/';
        var urlSuffix = '/candles?count=5&granularity=H12';
        $.each(pairs, function (i, pair) {
            var url = urlBase + pair + urlSuffix;
            $.ajax({ url: url }).then(_onDataGet);
        });


        // $.get('http://api-sandbox.oanda.com/v1/instruments/EUR_USD/candles?count=2&granularity=D');

    });

});