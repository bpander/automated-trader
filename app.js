var WebServer = require('./processes/WebServer.js');
var BackTester = require('./processes/BackTester.js');
var Observer = require('./Observer.js');

var observer = new Observer();
var webServer = new WebServer();
var backTester = new BackTester();

observer.observe([ webServer, backTester ]);


webServer.start();
backTester.start();
