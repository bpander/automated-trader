var events = require('events');

/**
 * This provides the base functionality for a ticker. A ticker is meant to get stock data and emit it to the AutomatedTrader.
 * @class
 */
function Ticker () {
    events.EventEmitter.call(this);
}
Ticker.prototype = new events.EventEmitter();
Ticker.prototype.constructor = Ticker;

Ticker.prototype.start = function () {
    throw new Error('Method does not have implementation');
};

/**
 * Emit a tick to the strategies linked to this ticker and pass in some data about the tick
 * @param  {*} data  Any data about the tick that you want to expose to the strategies added to this ticker
 * @return {Ticker}
 */
Ticker.prototype.tick = function (data) {
    this.emit('tick', data);
    return this;
};


module.exports = Ticker;