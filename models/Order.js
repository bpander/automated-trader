function Order (broker, options) {

    this.broker = broker;

    this.id = '';

    this.cost = 0.00;

    this.price = 0.00;

    this.options = {};

    this.options.instrument = options.instrument;

    this.options.units = options.units;

    this.options.side = options.side;

    this.options.type = options.type;

}


Order.prototype.send = function () {
    return this.broker.send(this);
};


Order.prototype.close = function () {
    return this.broker.close(this);
};


module.exports = Order;
