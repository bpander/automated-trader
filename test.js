var OandaBroker = require('./brokers/OandaBroker');
var Order = require('./models/Order');
var Util = require('./lib/Util');
var Instrument = require('./models/Instrument');

var oandaBroker = new OandaBroker();
var order = { id: '478445907' };

Util.log('Testing `close` method');
oandaBroker.close(order).then(function (response) {
    Util.log('Order complete', response);
}).catch(function (e) {
    Util.error('Oder failed:', e);
});