var q = require('q');

function AutomatedTrader () {

    this.tickers = [];

}

AutomatedTrader.prototype.useTicker = function (ticker) {
    this.tickers.push(ticker);
    return this;
};

AutomatedTrader.prototype.start = function () {
    return q.all(this.tickers.map(function (ticker) {
        return ticker.start();
    }));
};


module.exports = AutomatedTrader;