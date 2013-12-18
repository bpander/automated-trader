var Quote = require('../Quote.js');
var q = require('q');
var csv = require('csv');

function Pair (base, counter) {

    this.base = base;

    this.counter = counter;

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