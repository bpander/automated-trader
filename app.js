var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var ejs = require('ejs');
var AutomatedTrader = require('./models/AutomatedTrader.js');
var BreakoutStrategy = require('./models/strategies/BreakoutStrategy.js');
var StubTicker = require('./models/tickers/StubTicker.js');
var StubBroker = require('./models/brokers/StubBroker.js');

// Configuration
app.set('port', process.env.TEST_PORT || 80);
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', ejs.renderFile);

// Routes
app.get('/', function (req, res) {
    res.render(__dirname + '/views/index.html');
});

// Start listening for requests
// server.listen(app.get('port'), function () {
//     console.log('Express server listening on port ' + app.get('port'));
// });

// Run the automated trader
var automatedTrader = new AutomatedTrader();
var strategy = new BreakoutStrategy();
var ticker = new StubTicker();
var broker = new StubBroker();
automatedTrader.useTicker(ticker.useStrategy(strategy.useBroker(broker))).start().then(function () {

    var open = broker.orders.open.reduce(function (previous, order) {
        return previous + order.units;
    }, 0);
    var active = broker.orders.active.reduce(function (previous, order) {
        return previous + order.units * order.boughtAt / strategy.lastTick.bid;
    }, 0);
    var net = broker.balance + open + active - broker.seedMoney;
    console.log('lastTick', strategy.lastTick);
    console.log('seed money:', broker.seedMoney);
    console.log('total orders made:', broker.numOrders);
    console.log('orders per minute:', broker.numOrders / ((31 * 24 - 144) * 60) );
    console.log('balance:', broker.balance);
    console.log('open orders:', open);
    console.log('active orders:', active);
    console.log('avg gain per order', net / broker.numOrders);
    console.log('net gains after liquidation:', net);

});