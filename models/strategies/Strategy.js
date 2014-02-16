var Broker = require('../brokers/Broker.js');

function Strategy () {

    this.friendlyName = '';

    this.broker = new Broker();

}


Strategy.prototype.start = function () {

};


Strategy.prototype.tick = function (quote) {
    throw new Error('Method does not have implementation');
};


Strategy.prototype.useBroker = function (broker) {
    this.broker = broker;
    return this;
};


module.exports = Strategy;