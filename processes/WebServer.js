var Eventable = require('../lib/Eventable');


function WebServer () {
    Eventable.call(this);
}
WebServer.prototype = new Eventable();
WebServer.prototype.constructor = WebServer;


WebServer.prototype.start = function () {

};


module.exports = WebServer;
