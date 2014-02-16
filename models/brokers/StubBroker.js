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

var netGain = 0;

StubBroker.prototype.tick = function (quote) {
    var order;
    var i = this.orders.open.length;

    while (i--) {
        order = this.orders.open[i];
        if (quote.ask >= order.price) {
            this.orders.open.splice(i, 1);
            this.orders.active.push(order);
            order.boughtAt = quote.ask;
        } else if (quote.time > order.expiry) {
            this.orders.open.splice(i, 1);
            this.balance = this.balance + order.units;
        }
    }

    i = this.orders.active.length;
    while (i--) {
        order = this.orders.active[i];
        if (quote.bid <= order.takeProfit) {
            this.orders.active.splice(i, 1);
            netGain = netGain + (order.units * order.boughtAt / quote.bid - order.units);
            console.log(netGain, (quote.time - order.time) / 1000);
            this.balance = this.balance + order.units * order.boughtAt / quote.bid;
        }
    }
};

StubBroker.prototype.order = function (order) {
    this.balance = this.balance - order.units;
    this.numOrders = this.numOrders + 1;
    this.orders.open.push(order);
};

module.exports = StubBroker;
