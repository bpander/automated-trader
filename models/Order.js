function Order () {

    this.id = 268167142,

    this.instrument = "EUR_USD",

    this.units = 2,

    this.side = "sell",

    this.time = "2012-01-01T00:00:00Z",

    this.price = 1.2,

    this.takeProfit = 1.7,

    this.stopLoss = 1.4,

    this.expiry = "2013-02-01T00:00:00Z",

    this.upperBound = 0,

    this.lowerBound = 0,

    this.trailingStop = 0

}

Order.prototype.fromJSON = function (json) {

    // TODO

    return this;
};

module.exports = Order;
