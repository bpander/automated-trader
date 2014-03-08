var Eventable = require('../lib/Eventable');
var Order = require('./Order');


function Instrument (base, counter) {
    Eventable.call(this);

    this.base = base;

    this.counter = counter;

    this.orders = [];

}
Instrument.prototype = new Eventable();
Instrument.prototype.constructor = Instrument;


Instrument.prototype.toString = function () {
    return this.base + '_' + this.counter;
};


Instrument.prototype.order = function (broker, options) {
    options.instrument = this.toString();
    var self = this;
    var order = new Order(broker, options);
    this.orders.push(order);
    return order.send().then(function () {
        self.orders.push(order);
    });
};


Instrument.prototype.close = function (order) {
    var self = this;
    return order.close().then(function () {
        var index = self.orders.indexOf(order);
        if (index === -1) {
            Util.error('Error: Could not find order', order);
            return;
        }
        self.orders.splice(index, 1);
    });
};


module.exports = Instrument;
