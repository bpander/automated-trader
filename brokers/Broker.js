var Q = require('Q');


function Broker () {

    this.seedMoney = 1000;

    this.balance = this.seedMoney;

}


Broker.prototype.send = function (order) {
    var response = {
        instrument: order.options.instrument.toString(),
        time: new Date().toISOString(),
        price: order.options.side === 'sell' ? order.options.instrument.bid : order.options.instrument.ask,
        tradeOpened: {
            id: 175517237,
            units: order.options.units,
            side: order.options.side,
            takeProfit: order.options.takeProfit,
            stopLoss: order.options.stopLoss,
            trailingStop: order.options.trailingStop
        },
        tradesClosed: [],
        tradeReduced: {}
    };
    order.response = response;
    var delta;
    if (order.options.instrument.base === 'USD') {
        delta = response.tradeOpened.units;
    } else {
        delta = response.price * response.tradeOpened.units;
    }
    this.balance = this.balance - delta;
    console.log('-' + delta, this.balance, order.options.side, response.price, order.options.time);
};

var net = 0;

Broker.prototype.close = function (order) {
    var response = {
        id: 54332,
        instrument: order.options.instrument.toString(),
        units: order.options.units,
        side: order.options.side,
        price: order.options.side === 'sell' ? order.options.instrument.ask : order.options.instrument.bid,
        time: new Date().toISOString()
    };
    var delta = 0;
    if (order.options.instrument.base === 'USD') {
        delta = Math.abs(order.response.price - response.price) * response.units / response.price;
        this.balance = this.balance + delta + response.units;
    } else {
        delta = Math.abs(order.response.price - response.price) * response.units;
        this.balance = this.balance + delta + response.units * order.response.price;
    }
    net = net + delta;
    console.log('+' + delta, net, this.balance, order.options.side, response.price);
};


module.exports = Broker;
