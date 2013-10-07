var Broker = require('./Broker.js');

function StubBroker () {
    Broker.call(this);

    this.orders = {
        open:   [],
        active: [],
        closed: []
    };

}
StubBroker.prototype = new Broker();
StubBroker.prototype.constructor = StubBroker;

StubBroker.prototype.tick = function (data) {

};

StubBroker.prototype.order = function (data) {
    console.log(data);
};

module.exports = StubBroker;
