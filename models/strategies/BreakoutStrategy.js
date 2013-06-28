var request = require('request');
var Strategy = require('./Strategy.js');
var Pair = require('../Pair.js');
var DataProvider = require('../DataProvider.js');

var BreakoutStrategy = function() {
    Strategy.call(this);

    this.friendlyName = 'Breakout';

};
BreakoutStrategy.prototype = new Strategy();
BreakoutStrategy.prototype.constructor = BreakoutStrategy;

BreakoutStrategy.prototype.start = function () {
    console.log('BreakoutStrategy start');
    DataProvider.get(new Pair('USD', 'JPY'), { count: 4, granularity: 'H12' }).then(function () {
        console.log('got');
    });
};

BreakoutStrategy.prototype.tick = function (data) {
    console.log('BreakoutStrategy tick', data);
};

module.exports = BreakoutStrategy;