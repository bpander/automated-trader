function AutomatedTrader () {

    this.tickers = [];

}

AutomatedTrader.prototype.useTicker = function (ticker) {
    this.tickers.push(ticker);
    return this;
};

AutomatedTrader.prototype.start = function () {
    this.tickers.forEach(function (ticker) {
        ticker.start();
    });
    return this;
};


module.exports = AutomatedTrader;