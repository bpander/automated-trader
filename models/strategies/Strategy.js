function Strategy () {

    this.friendlyName = '';

    this.brokers = [];

}


Strategy.prototype.tick = function (quote) {
    throw new Error('Method does not have implementation');
};


Strategy.prototype.useBroker = function (broker) {
    this.brokers.push(broker);
    return this;
};


Strategy.prototype.order = function (order) {
    this.brokers.forEach(function (broker) {
        broker.order(order);
    });
    return this;
};


module.exports = Strategy;