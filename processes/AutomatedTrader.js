var Eventable = require('../lib/Eventable');
var HighLowStrategy = require('../strategies/HighLowStrategy');
var Q = require('Q');


function AutomatedTrader () {
    Eventable.call(this);

    this.strategyCollection = new StrategyCollection([
        new HighLowStrategy()
    ]);

}
AutomatedTrader.prototype = new Eventable();
AutomatedTrader.prototype.constructor = AutomatedTrader;


AutomatedTrader.prototype.start = function () {
    this.instrumentCollection.applyStrategies(this.strategyCollection);
    this.instrumentCollection.subscribe();
    return this;
};


/**
 * @method  backTest
 * @description  Test the AutomatedTrader using historical data
 * @param  {Number}     start   In milliseconds. Gather data from this point
 * @param  {Number}     end     In milliseconds. Gather data to this point
 * @return {Q.Promise}  A promise that gets resolved when the back testing is complete
 */
AutomatedTrader.prototype.backTest = function (start, end) {
    var tickCollection;
    this.instrumentCollection.applyStrategies(this.strategyCollection);

    tickCollection = this.instrumentCollection.getHistory();
    tickCollection.forEach(function (tick) {
        this.instrumentCollection._onTick(tick);
    }, this);
};


module.exports = AutomatedTrader;
