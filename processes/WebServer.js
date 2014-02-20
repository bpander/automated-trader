var PubSub = require('../PubSub.js');


function WebServer () {
    PubSub.call(this);
}
WebServer.prototype = new PubSub();
WebServer.prototype.constructor = WebServer;


WebServer.prototype.start = function () {
    console.log('WebServer starting');
    this.publish('WebServer:backTestRequest');
};

module.exports = WebServer;
