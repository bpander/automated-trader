// New Relic pings the site continually to prevent Heroku from idling and falling asleep
require('newrelic');

var WebServer = require('./processes/WebServer');
var AutomatedTrader = require('./processes/AutomatedTrader');
var Observer = require('./lib/Observer');


// 1. Instantiate any processes
var webServer = new WebServer();
var automatedTrader = new AutomatedTrader();
var observer = new Observer();


// 2. Create a parent observer to relay events between processes that need to communicate with each other
observer.observe([ webServer, automatedTrader ]);


// 3. Start the processes
webServer.start();
automatedTrader.start();
