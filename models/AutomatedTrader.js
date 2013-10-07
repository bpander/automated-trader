function AutomatedTrader () {

    this.strategies = [];

    this.tickers = [];

    this.brokers = [];

    this._onTick = this._onTick.bind(this);

    this._onOrder = this._onOrder.bind(this);

}

AutomatedTrader.prototype.useStrategy = function (strategy) {
    this.strategies.push(strategy);
    strategy.on('order', this._onOrder);
    return this;
};

AutomatedTrader.prototype.useTicker = function (ticker) {
    this.tickers.push(ticker);
    ticker.on('tick', this._onTick);
    return this;
};

AutomatedTrader.prototype.useBroker = function (broker) {
    this.brokers.push(broker);
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
    this.brokers.forEach(function (broker) {
        broker.tick(data);
    });
};

AutomatedTrader.prototype._onOrder = function (data) {
    this.brokers.forEach(function (broker) {
        broker.order(data);
    });
};

module.exports = AutomatedTrader;
