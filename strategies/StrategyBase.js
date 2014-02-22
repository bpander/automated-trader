var Eventable = require('../lib/Eventable');
var InstrumentCollection = require('../models/InstrumentCollection');


function StrategyBase () {
    Eventable.call(this);

    this.instrumentCollection = new InstrumentCollection();

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
    this.start();
    this.instrumentCollection.getHistory(start, end).then(function (ticks) {
        try {
            ticks.forEach(function (tick) {
                self.instrumentCollection._onTick(tick);
            });
        } catch (e) {
            console.error(e);
        }
    });
    return this;
};


module.exports = StrategyBase;
