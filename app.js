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

    var open = broker.orders.open.reduce(function (previous, current) {
        return previous + current.units;
    }, 0);
    var active = broker.orders.active.reduce(function (previous, current) {
        return previous + current.price / strategy.lastTick.bid * current.units;
    }, 0);
    console.log('seed money:', broker.seedMoney);
    console.log('total orders made:', broker.numOrders);
    console.log('balance:', broker.balance);
    console.log('open orders:', open);
    console.log('active orders:', active);
    console.log('net gains after liquidation:', broker.balance + open + active - broker.seedMoney);

});