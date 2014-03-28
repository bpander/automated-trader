var OandaApi = require('../lib/OandaApi');
var Util = require('../lib/Util');
var SETTINGS = require('../SETTINGS');


function OandaBroker () {

    this.balance = 0;

}

var TODO = 0;

OandaBroker.prototype.start = function () {
    var self = this;
    Util.log('Fetching OandaBroker\'s balance');
    return OandaApi.request({
        path: '/v1/accounts/' + SETTINGS.OANDA_ACCOUNT_ID,
        method: 'GET'
    }).then(function (response) {
        self.balance = response.balance;
    });
};


OandaBroker.prototype.send = function (order) {
    var self = this;
    var estimatedCost = TODO;
    this.balance = this.balance - estimatedCost;
    order.options.instrument = order.options.instrument.toString();
    return OandaApi.request({
        path: '/v1/accounts/' + SETTINGS.OANDA_ACCOUNT_ID + '/orders',
        method: 'POST',
        form: order.options
    }).then(function (response) {
        var orderCost = TODO;
        order.id = response.tradeOpened.id;
        self.balance = self.balance + estimatedCost;
        self.balance = self.balance - orderCost;
    }).catch(function () {
        self.balance = self.balance + estimatedCost;
    });
};


OandaBroker.prototype.close = function (order) {
    var self = this;
    return OandaApi.request({
        path: '/v1/accounts/' + SETTINGS.OANDA_ACCOUNT_ID + '/trades/' + order.id,
        method: 'DELETE'
    }).then(function (response) {
        var orderCost = TODO;
        self.balance = self.balance + orderCost + response.profit;
    });
};


module.exports = OandaBroker;
