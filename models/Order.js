function Order (broker, options) {

    this.broker = broker;

    this.options = {};

    this.options.instrument = options.instrument;

    this.options.units = options.units;

    this.options.side = options.side;

    this.options.type = options.type;

    this.options.time = options.time;

}


Order.prototype.send = function () {
    return this.broker.send(this);
};


Order.prototype.close = function () {
    return this.broker.close(this);
};


module.exports = Order;
