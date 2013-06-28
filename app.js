var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var ejs = require('ejs');
var nano = require('nano')('http://automatedtrader.iriscouch.com');
var OandaTicker = require('./models/tickers/OandaTicker.js');
var StubTicker = require('./models/tickers/StubTicker.js');
var BreakoutStrategy = require('./models/strategies/BreakoutStrategy.js');

// Middleware
app.set('port', process.env.TEST_PORT || 80);
// app.use(express.favicon());
// app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', ejs.renderFile);

// Routes
app.get('/', function (req, res) {
    res.render(__dirname + '/views/index.html');
});

var breakoutStrategy = new BreakoutStrategy();
var ticker = new OandaTicker(server);
ticker.addStrategy(breakoutStrategy);

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});