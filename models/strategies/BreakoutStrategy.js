var Strategy = require('./Strategy.js');

var BreakoutStrategy = function() {
    Strategy.call(this);

    this.friendlyName = 'Breakout';

};
BreakoutStrategy.prototype = new Strategy();
BreakoutStrategy.prototype.constructor = BreakoutStrategy;

BreakoutStrategy.prototype.start = function () {
    console.log('BreakoutStrategy start');
};

BreakoutStrategy.prototype.tick = function (data) {
    console.log('BreakoutStrategy tick', data);
};

module.exports = BreakoutStrategy;