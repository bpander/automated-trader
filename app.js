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
automatedTrader.useStrategy(strategy).useTicker(ticker).useBroker(broker).start();

var _reduceFn = function (previous, current) {
    return previous + current.price;
};
console.log('balance', broker.balance);
console.log('open orders', broker.orders.open.reduce(_reduceFn, 0));
console.log('active orders', broker.orders.active.reduce(_reduceFn, 0));
console.log('total orders', broker.numOrders);