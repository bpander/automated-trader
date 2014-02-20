var Eventable = require('../lib/Eventable');


function StrategyBase () {
    Eventable.call(this);

}
StrategyBase.prototype = new Eventable();
StrategyBase.prototype.constructor = StrategyBase;


module.exports = StrategyBase;
