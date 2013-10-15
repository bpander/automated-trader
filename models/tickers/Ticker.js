/**
 * This provides the base functionality for a ticker. A ticker is meant to get stock data and transmit it to its child strategies
 * @class
 */
function Ticker () {

    this.strategies = [];

}


Ticker.prototype.useStrategy = function (strategy) {
    this.strategies.push(strategy);
    return this;
};


Ticker.prototype.start = function () {
    throw new Error('Method does not have implementation');
};


Ticker.prototype.tick = function (tick) {
    this.strategies.forEach(function (strategy) {
        strategy.tick(tick);
        strategy.brokers.forEach(function (broker) {
            broker.tick(tick);
        });
    });
    return this;
};


module.exports = Ticker;