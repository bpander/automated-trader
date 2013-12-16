var Candle = require('../Candle.js');
var Quote = require('../Quote.js');
var q = require('q');
var csv = require('csv');

function Pair () {

    this.base = '';

    this.counter = '';

    this.pip = 0.00;

    this.spread = 0.00;

};


var _sourceDirectory = './public/csv/';


Pair.prototype.toString = function () {
    return this.base + '_' + this.counter;
};


Pair.prototype.getHistoricalData = function () {
    var dfd = q.defer();
    csv().from(_sourceDirectory + this.toString() + '.csv').to.array(function (quotesRaw) {
        var quotes = quotesRaw.map(function (quoteRaw) {
            return new Quote().fromArray(quoteRaw);
        });
        dfd.resolve(quotes);
    });
    return dfd.promise;
};


module.exports = Pair;