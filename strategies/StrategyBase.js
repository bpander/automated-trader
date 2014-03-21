var Eventable = require('../lib/Eventable');
var Broker = require('../brokers/Broker');
var OandaBroker = require('../brokers/OandaBroker');


function StrategyBase () {
    Eventable.call(this);

    this.broker = null;

}
StrategyBase.prototype = new Eventable();
StrategyBase.prototype.constructor = StrategyBase;


StrategyBase.prototype.start = function () {
    this.broker = new OandaBroker();
    return this.broker.start();
};


StrategyBase.prototype.backTest = function (start, end) {
    this.broker = new Broker();
    return this;
};


module.exports = StrategyBase;
