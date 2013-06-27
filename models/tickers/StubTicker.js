var Ticker = require('./Ticker.js');

var StubTicker = function (server) {
    Ticker.call(this);

    _init.call(this);
};
StubTicker.prototype = new Ticker();
StubTicker.prototype.constructor = StubTicker;

var _init = function () {
    setInterval(function () {

        this.tick(Math.random());

    }.bind(this), 1000);
};


module.exports = StubTicker;