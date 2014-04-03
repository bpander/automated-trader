var Q = require('q');
var Util = require('../lib/Util');
var TimeKeeper = require('../lib/TimeKeeper');


function Broker () {

    this.seedMoney = 1000;

    this.balance = this.seedMoney;

}


Broker.prototype.send = function (order) {
    var response = {
        instrument: order.options.instrument.toString(),
        time: new Date(TimeKeeper.now()).toISOString(),
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
    var delta;
    if (order.options.instrument.base === 'USD') {
        delta = response.tradeOpened.units;
    } else {
        delta = response.price * response.tradeOpened.units;
    }
    order.price = response.price;
    order.cost = delta;
    this.balance = this.balance - delta;
    Util.log('-' + delta, this.balance, order.options.side, response.price, response.time);
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
        delta = Math.abs(order.price - response.price) * response.units / response.price;
        this.balance = this.balance + delta + response.units;
    } else {
        delta = Math.abs(order.price - response.price) * response.units;
        this.balance = this.balance + delta + response.units * order.price;
    }
    net = net + delta;
    Util.log('+' + delta, net, this.balance, order.options.side, response.price);
};


module.exports = Broker;
