var OandaBroker = require('./brokers/OandaBroker');
var Order = require('./models/Order');
var Util = require('./lib/Util');
var Instrument = require('./models/Instrument');

var oandaBroker = new OandaBroker();
var order = new Order(oandaBroker, {
    instrument: new Instrument('USD', 'JPY'),
    units: 2,
    side: 'sell',
    type: 'market'
});

Util.log('Testing `send` method');
oandaBroker.send(order).then(function (response) {
    Util.log('Order complete', response);
}).catch(function (e) {
    Util.error('Oder failed:', e);
});