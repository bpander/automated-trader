var Eventable = require('../lib/Eventable');
var InstrumentCollection = require('../models/InstrumentCollection');
var Q = require('Q');


function StrategyBase () {
    Eventable.call(this);

    this.instrumentCollection = new InstrumentCollection();

    this.broker = null;

}
StrategyBase.prototype = new Eventable();
StrategyBase.prototype.constructor = StrategyBase;


StrategyBase.EVENT = {
    SIGNAL: 'signal'
};


StrategyBase.prototype.start = function () {
    return this;
};


StrategyBase.prototype.backTest = function (start, end) {
    var self = this;
    return this.start()
        .then(function () {
            return self.instrumentCollection.getHistory(start, end);
        })
        .then(function (ticks) {
            var i = 0;
            var l = ticks.length;
            var processTick = function () {
                var dfd = Q.defer();
                self.instrumentCollection._onTick(ticks[i]);
                i++;
                if (i !== l) {
                    dfd.promise.then(processTick);
                    dfd.resolve();
                } else {
                    done();
                }
            };
            var done = function () {
                var outstanding = self.orders.reduce(function (previous, current) {
                    var originalInput = current.options.instrument.base === 'USD' ? current.options.units : current.options.units * current.response.price;
                    return previous + originalInput;
                }, 0);
                console.log('balance:', self.broker.balance);
                console.log('outstanding orders:', self.orders.length, '@', outstanding);
                console.log('net:', self.broker.balance + outstanding - self.broker.seedMoney);
            };
            processTick();
        })
    ;
};


StrategyBase.prototype.setBroker = function (broker) {
    this.broker = broker;
    return this;
};


module.exports = StrategyBase;
