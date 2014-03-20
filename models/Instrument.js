var Eventable = require('../lib/Eventable');
var Order = require('./Order');


function Instrument (base, counter) {
    Eventable.call(this);

    this.base = base;

    this.counter = counter;

    this.bid;

    this.ask;

    this.orders = [];

}
Instrument.prototype = new Eventable();
Instrument.prototype.constructor = Instrument;


Instrument.prototype.toString = function () {
    return this.base + '_' + this.counter;
};


Instrument.prototype.order = function (broker, options) {
    options.instrument = this;
    var order = new Order(broker, options);
    this.orders.push(order);
    order.send();
    return this;
};


Instrument.prototype.close = function (order) {
    order.close();
    var index = this.orders.indexOf(order);
    if (index === -1) {
        Util.error('Error: Could not find order', order);
        return;
    }
    this.orders.splice(index, 1);
};


module.exports = Instrument;
