var OandaApi = require('../lib/OandaApi');
var Util = require('../lib/Util');
var SETTINGS = require('../SETTINGS');
var extend = require('node.extend');


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
        Util.log('Balance got:', response.balance);
        self.balance = response.balance;
    });
};


OandaBroker.prototype.send = function (order) {
    var self = this;
    var price = order.options.side === 'sell' ? order.options.instrument.bid : order.options.instrument.ask;
    var estimatedCost = order.options.instrument.base === 'USD' ? order.options.units : price * order.options.units;
    this.balance = this.balance - estimatedCost;
    Util.log('Attempting order...');
    return OandaApi.request({
        path: '/v1/accounts/' + SETTINGS.OANDA_ACCOUNT_ID + '/orders',
        method: 'POST',
        form: extend({}, order.options, { instrument: order.options.instrument.toString() })
    }).then(function (response) {
        order.id = response.tradeOpened.id;
        order.cost = order.options.instrument.base === 'USD' ? response.tradeOpened.units : response.price * response.tradeOpened.units;
        order.price = response.price;
        self.balance = self.balance + estimatedCost;
        self.balance = self.balance - order.cost;
        Util.log('Order succeeded:', '-' + order.cost, response.time);
    }).catch(function (e) {
        self.balance = self.balance + estimatedCost;
        Util.log('Order failed:', e);
    });
};


OandaBroker.prototype.close = function (order) {
    var self = this;
    Util.log('Attempting close...');
    return OandaApi.request({
        path: '/v1/accounts/' + SETTINGS.OANDA_ACCOUNT_ID + '/trades/' + order.id,
        method: 'DELETE'
    }).then(function (response) {
        self.balance = self.balance + order.cost + response.profit;
        Util.log('Close succeeded:', '+' + response.profit, response.time);
    }).catch(function (e) {
        Util.log('Close failed:', e);
    });
};


module.exports = OandaBroker;
