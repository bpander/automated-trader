var Eventable = require('../lib/Eventable');
var StrategyBase = require('../strategies/StrategyBase');
var HighLowStrategy = require('../strategies/HighLowStrategy');
var Q = require('Q');
var Util = require('../lib/Util');


function AutomatedTrader () {
    Eventable.call(this);

    this.strategies = [
        new HighLowStrategy()
    ];

}
AutomatedTrader.prototype = new Eventable();
AutomatedTrader.prototype.constructor = AutomatedTrader;


AutomatedTrader.prototype.start = function () {
    Util.log('Starting AutomatedTrader');
    return Q.all(this.strategies.map(function (strategy) {
        return strategy.start();
    })).then(function () {
        Util.log('AutomatedTrader started successfully');
    }, function (e) {
        Util.error('AutomatedTrader errored:', e);
    });
};


/**
 * @method  backTest
 * @description  Test the AutomatedTrader using historical data
 * @param  {Date}     start   Back-test from this point
 * @param  {Date}     end     Back-test to this point
 * @return {Q.Promise}
 */
AutomatedTrader.prototype.backTest = function (start, end) {
    return Q.all(this.strategies.map(function (strategy) {
        return strategy.backTest(start, end);
    }));
};


module.exports = AutomatedTrader;
