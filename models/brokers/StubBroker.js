var Broker = require('./Broker.js');

function StubBroker () {
    Broker.call(this);

    this.orders = {
        open:   [],
        active: []
    };

    this.balance = 0;

    this.numOrders = 0;

}
StubBroker.prototype = new Broker();
StubBroker.prototype.constructor = StubBroker;

StubBroker.prototype.tick = function (tick) {
    var order;
    var i = this.orders.open.length;

    while (i--) {
        order = this.orders.open[i];
        if (tick.ask <= order.price) {
            this.orders.active.push(order);
            this.orders.open.splice(i, 1);
            this.balance = this.balance - order.units;
        }
    }

    i = this.orders.active.length;
    while (i--) {
        order = this.orders.active[i];
        if (tick.bid <= order.takeProfit || tick.bid >= order.stopLoss) {
            this.orders.active.splice(i, 1);
            this.balance = this.balance + order.price / tick.bid * order.units;
        }
    }
};

StubBroker.prototype.order = function (order) {
    this.numOrders = this.numOrders + 1;
    this.orders.open.push(order);
};

module.exports = StubBroker;
