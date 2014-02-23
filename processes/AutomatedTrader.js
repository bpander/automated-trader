var Eventable = require('../lib/Eventable');
var StrategyBase = require('../strategies/StrategyBase');
var HighLowStrategy = require('../strategies/HighLowStrategy');
var Broker = require('../brokers/Broker');


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
    var broker = new Broker();
    this.strategies.forEach(function (strategy) {
        strategy.setBroker(broker);
        strategy.backTest(start, end);
    }, this);
    return this;
};


module.exports = AutomatedTrader;
