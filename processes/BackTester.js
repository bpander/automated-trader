var PubSub = require('../PubSub.js');

function BackTester () {
    PubSub.call(this);
}
BackTester.prototype = new PubSub();
BackTester.prototype.constructor = BackTester;

BackTester.prototype.start = function () {
	console.log('BackTester subscribing');
    this.subscribe('WebServer:backTestRequest', this.onBackTestRequest);
};

BackTester.prototype.onBackTestRequest = function () {
	console.log('onBackTestRequest');
};


module.exports = BackTester;
