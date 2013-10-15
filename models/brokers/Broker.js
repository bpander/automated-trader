function Broker () {

    this.balance = 0;

    this.tick = this.tick.bind(this);

    this.order = this.order.bind(this);

}


Broker.prototype.tick = function (quote) {
    throw new Error('method not implemented');
};


Broker.prototype.order = function (order) {
    throw new Error('method not implemented');
};


module.exports = Broker;