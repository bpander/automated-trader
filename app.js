var WebServer = require('./processes/WebServer.js');
var BackTester = require('./processes/BackTester.js');
var Observer = require('./lib/Observer.js');


// 1. Instantiate any processes
var webServer = new WebServer();
var backTester = new BackTester();
var observer = new Observer();


// 2. Create a parent observer to relay events between processes that need to communicate with each other
observer.observe([ webServer, backTester ]);


// 3. Start the processes
webServer.start();
backTester.start();
