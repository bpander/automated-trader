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
 * @param  {Date}     start   Back-test from this point
 * @param  {Date}     end     Back-test to this point
 * @return {AutomatedTrader}
 */
AutomatedTrader.prototype.backTest = function (start, end) {
    this.strategies.forEach(function (strategy) {
        strategy.backTest(start, end);
    }, this);
    return this;
};


module.exports = AutomatedTrader;
