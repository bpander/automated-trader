var Broker = require('./Broker.js');

function StubBroker () {
    Broker.call(this);

    this.orders = {
        open:   [],
        active: []
    };

    this.seedMoney = 100;

    this.balance = this.seedMoney;

    this.numOrders = 0;

}
StubBroker.prototype = new Broker();
StubBroker.prototype.constructor = StubBroker;

StubBroker.prototype.tick = function (quote) {
    var order;
    var i = this.orders.open.length;

    while (i--) {
        order = this.orders.open[i];
        if (quote.ask < order.price) {
            this.orders.active.push(order);
            this.orders.open.splice(i, 1);
            this.balance = this.balance + order.units / order.price;
            this.balance = this.balance - order.units / quote.ask;
        } else if (order.expiry <= quote.time) {
            this.orders.open.splice(i, 1);
            this.balance = this.balance + order.units / order.price;
        }
    }

    i = this.orders.active.length;
    while (i--) {
        order = this.orders.active[i];
        if (quote.bid <= order.takeProfit) {
            this.orders.active.splice(i, 1);
            this.balance = this.balance + order.units / quote.bid;
        }
    }
};

StubBroker.prototype.order = function (order) {
    this.balance = this.balance - order.units / order.price;
    this.numOrders = this.numOrders + 1;
    this.orders.open.push(order);
};

module.exports = StubBroker;
