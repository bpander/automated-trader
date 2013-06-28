var OandaTicker = require('./tickers/OandaTicker.js');
var StubTicker = require('./tickers/StubTicker.js');
var BreakoutStrategy = require('./strategies/BreakoutStrategy.js');


var AutomatedTrader = function (server) {

    this.breakoutStrategy = new BreakoutStrategy();
    this.ticker = new StubTicker(server);
    this.ticker.addStrategy(this.breakoutStrategy);

};

module.exports = AutomatedTrader;