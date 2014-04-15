var AutomatedTrader = require('./processes/AutomatedTrader');

var automatedTrader = new AutomatedTrader();

automatedTrader.backTest(new Date('01 Mar 2014'), new Date('01 Apr 2014'));
