var express = require('express');
var http = require('http');
var Q = require('q');
var Eventable = require('../lib/Eventable');
var Util = require('../lib/Util');


function WebServer () {
    Eventable.call(this);

    this.app = express();

    this.server = http.createServer(this.app);

}
WebServer.prototype = new Eventable();
WebServer.prototype.constructor = WebServer;


WebServer.prototype.routes = {

    'GET /': function (request, response) {
        response.send('Running...');
    }

};


WebServer.prototype.start = function () {
    var dfd = Q.defer();
    var port = process.env.TEST_PORT || 9001;
    this.app.set('port', port);
    this.bindRoutes();
    this.server.listen(port, function () {
        Util.log('Express server listening on port ' + port);
        dfd.resolve();
    });
    return dfd.promise;
};


WebServer.prototype.bindRoutes = function () {
    var route;
    var routeArray;
    var method;
    var path;
    for (route in this.routes) {
        if (this.routes.hasOwnProperty(route)) {
            routeArray = route.split(' ');
            method = routeArray[0].toLowerCase();
            path = routeArray[1];
            this.app[method](path, this.routes[route]);
        }
    }
    return this;
};


module.exports = WebServer;
