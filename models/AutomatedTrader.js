function AutomatedTrader () {

    this.strategies = [];

    this.tickers = [];

    this._onTick = this._onTick.bind(this);

}

AutomatedTrader.prototype.useStrategy = function (strategy) {
    this.strategies.push(strategy);
    return this;
};

AutomatedTrader.prototype.useTicker = function (ticker) {
    this.tickers.push(ticker);
    ticker.on('tick', this._onTick);
    return this;
}

AutomatedTrader.prototype.start = function () {
    this.tickers.forEach(function (ticker) {
        ticker.start();
    });
    return this;
};

AutomatedTrader.prototype._onTick = function (data) {
    this.strategies.forEach(function (strategy) {
        strategy.tick(data);
    });
};

module.exports = AutomatedTrader;
