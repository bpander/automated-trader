var OandaApi = require('../lib/OandaApi');
var Util = require('../lib/Util');
var SETTINGS = require('../SETTINGS');


function OandaBroker () {

    this.seedMoney = 0;

    this.balance = this.seedMoney;

}


OandaBroker.prototype.start = function () {
    Util.log('Fetching OandaBroker\'s balance');
    return OandaApi.request({
        path: 'v1/accounts/' + SETTINGS.OANDA_ACCOUNT_ID,
        method: 'GET'
    });
};


OandaBroker.prototype.send = function () {

};


OandaBroker.prototype.close = function () {

};


module.exports = OandaBroker;
