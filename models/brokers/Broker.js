function Broker () {

    this.tick = this.tick.bind(this);

    this.order = this.order.bind(this);

}

Broker.prototype.tick = function (data) {
    throw new Error('method not implemented');
};

Broker.prototype.order = function (data) {
    throw new Error('method not implemented');
};

module.exports = Broker;
