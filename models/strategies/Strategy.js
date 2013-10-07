var events = require('events');

function Strategy () {
    events.EventEmitter.call(this);

    this.friendlyName = '';

}
Strategy.prototype = new events.EventEmitter();
Strategy.prototype.constuctor = Strategy;

Strategy.prototype.start = function () {
    throw new Error('Method does not have implementation');
};

Strategy.prototype.tick = function (data) {
    throw new Error('Method does not have implementation');
};

Strategy.prototype.order = function (data) {
    this.emit('order', data);
};

module.exports = Strategy;