/**
 * This provides the base functionality for a ticker. A ticker is meant to get stock data and emit it to the strategies bound to it.
 * @class
 */
var Ticker = function () {

    /**
     * The collection of strategies bound to this ticker
     * @type {Strategy[]}
     */
    this.strategies = [];

};

/**
 * Emit a tick to the strategies linked to this ticker and pass in some data about the tick
 * @param  {*} data  Any data about the tick that you want to expose to the strategies added to this ticker
 * @return {Ticker}
 */
Ticker.prototype.tick = function (data) {
    var i = this.strategies.length;
    while (i-- !== 0) {
        this.strategies[i].tick(data);
    }
    return this;
};

/**
 * Add a strategy to this ticker
 * @param  {Strategy} strategy  When added to this ticker, the strategy's `start` method will be invoked. Its `tick` method will be invoked whenever the ticker invokes ITS `tick` method.`
 * @return {Ticker}
 */
Ticker.prototype.addStrategy = function (strategy) {
    this.strategies.push(strategy);
    strategy.start();
};


module.exports = Ticker;