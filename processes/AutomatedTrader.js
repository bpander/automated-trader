var Eventable = require('../lib/Eventable');
var StrategyBase = require('../strategies/StrategyBase');
var HighLowStrategy = require('../strategies/HighLowStrategy');


function AutomatedTrader () {
    Eventable.call(this);

    this.strategies = [
        new HighLowStrategy()
    ];

}
AutomatedTrader.prototype = new Eventable();
AutomatedTrader.prototype.constructor = AutomatedTrader;


AutomatedTrader.prototype.start = function () {
    this.strategies.forEach(function (strategy) {
        strategy.start();
    }, this);
    return this;
};


/**
 * @method  backTest
 * @description  Test the AutomatedTrader using historical data
 * @param  {Number}     start   In milliseconds. Gather data from this point
 * @param  {Number}     end     In milliseconds. Gather data to this point
 * @return {AutomatedTrader}
 */
AutomatedTrader.prototype.backTest = function (start, end) {
    this.strategies.forEach(function (strategy) {
        strategy.on(StrategyBase.EVENT.SIGNAL, this._onBackTestSignal);
        strategy.backTest(start, end);
    }, this);
    return this;
};


AutomatedTrader.prototype._onBackTestSignal = function (e) {
    // TODO: Figure out how to give Strategies access to current balance
    // TODO: Figure out how to give Strategies access to open orders
    // TODO: Figure out how to use stub broker when back testing and real broker when running
};


module.exports = AutomatedTrader;
