var Q = require('Q');


function Broker () {

    this.seedMoney = 1000;

    this.balance = this.seedMoney;

}

var TODO = 1;


Broker.prototype.send = function (order) {
    var dfd = Q.defer();
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
    this.balance = this.balance - (order.options.instrument.base === 'USD' ? 1 / response.price : response.price) * response.tradeOpened.units;
    dfd.resolve();
    return dfd.promise;
};

var net = 0;

Broker.prototype.close = function (order) {
    var dfd = Q.defer();
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
        delta = Math.abs(1 / order.response.price - 1 / response.price) * order.options.units;
        this.balance = this.balance + delta + order.options.units;
    } else {
        delta = Math.abs(order.response.price - response.price) * order.options.units;
        this.balance = this.balance + delta + order.options.units * order.response.price;
    }
    net = net + delta;
    dfd.resolve();
    return dfd.promise;
};


module.exports = Broker;
