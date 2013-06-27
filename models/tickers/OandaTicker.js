var Ticker = require('./Ticker.js');
var socketIO = require('socket.io');
var socketIOClient = require('socket.io-client');

var OandaTicker = function (server) {
    Ticker.call(this);

    this.socket = null;

    _init.call(this, server);
};
OandaTicker.prototype = new Ticker();
OandaTicker.prototype.constructor = OandaTicker;

var _init = function (server) {
    _bindScope.call(this);

    console.log('Attemping to connect to Oanda Ratestream...');
    this.socket = socketIOClient.connect('http://api-sandbox.oanda.com', { 'force new connection':true , resource:'ratestream' });
    this.bindEvents();
};

var _bindScope = function () {
    this.onError = _eventHandlers.onError.bind(this);
    this.onConnect = _eventHandlers.onConnect.bind(this);
    this.onTick = _eventHandlers.onTick.bind(this);
};

var _eventHandlers = {

    onError: function (error) {
        console.log('Could not connect to Oanda Ratestream: ', error);
    },

    onConnect: function () {
        console.log('Connected to Oanda Ratestream');
        this.socket.emit('subscribe', { instruments: 'EUR/USD' });
        this.socket.on('tick', this.onTick);
    },

    onTick: function (data) {
        this.tick(data);
    }

};

OandaTicker.prototype.bindEvents = function () {
    this.socket.on('connect', this.onConnect);
    this.socket.on('error', this.onError);
};

module.exports = OandaTicker;