var fs = require('fs')
var AutomatedTrader = require('./models/AutomatedTrader.js');

var automatedTrader = new AutomatedTrader();
var overallBalance = 0;
var overallOpenOrderBalance = 0;
var stubData = JSON.parse(fs.readFileSync('./public/json/USD_JPY.json'));
var candles = stubData.candles;
var i = 3;
var l = candles.length;
for (; i !== l; i++) {
    data = candles.slice(i - 3, i);
    automatedTrader.breakoutStrategy.test(data).then(function (data) {
        overallBalance = overallBalance + data.balance;
        overallOpenOrderBalance = overallOpenOrderBalance + data.openOrderValue;
        console.log('overallBalance', overallBalance, overallOpenOrderBalance);
    });
}