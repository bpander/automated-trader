var Q = require('Q');
var mysql = require('mysql');
var SETTINGS = require('../SETTINGS');


function InstrumentCollection (models) {

    this.socket = null;

    this.models = models;

    this._onTick = this._onTick.bind(this);

}


InstrumentCollection.prototype.subscribe = function () {
    var instruments = this.models.map(function (model) {
        return model.base + '/' + model.counter;
    });
    this.socket = io.connect('http://api-sandbox.oanda.com', { resource: 'ratestream' });
    this.socket.emit('subscribe', { instruments: instruments });
    this.socket.on('tick', this._onTick);
    return this;
};


InstrumentCollection.prototype.getHistory = function (start, end) {
    console.log('Getting instrument history');
    var dfd = Q.defer();
    var connection = mysql.createConnection({
        host: SETTINGS.MYSQL_HOST,
        port: SETTINGS.MYSQL_PORT,
        user: SETTINGS.MYSQL_USER,
        password: SETTINGS.MYSQL_PASSWORD,
        database: SETTINGS.MYSQL_DATABASE
    });
    var statement = 'SELECT * FROM ticks WHERE (';
    var lastIndex = this.models.length - 1;
    this.models.forEach(function (model, i) {
        statement = statement + 'instrument = "' + model.base + '/' + model.counter + '"';
        if (i !== lastIndex) {
            statement = statement + ' OR ';
        } else {
            statement = statement + ')';
        }
    });
    if (start) {
        statement = statement + ' AND timestamp > ' + start.getTime();
    }
    if (end) {
        statement = statement + ' AND timestamp < ' + end.getTime();
    }
    statement = statement + ' ORDER BY timestamp ASC';
    connection.query(statement, function (error, data) {
        if (error) {
            console.log('Error:', error);
            return;
        }
        console.log('Got instrument history');
        connection.end();
        dfd.resolve(data);
    });
    return dfd.promise;
};


InstrumentCollection.prototype._onTick = function (data) {
    var pair = data.instrument.split('/');
    var instrument = this.getInstrument(pair[0], pair[1]);
    instrument.trigger('tick', data);
};


InstrumentCollection.prototype.getInstrument = function (base, counter) {
    var i = 0;
    var l = this.models.length;
    var model;
    var instrument = null;
    for (; i !== l; i++) {
        model = this.models[i];
        if (model.base === base && model.counter === counter) {
            instrument = model;
        }
    }
    return instrument;
};


module.exports = InstrumentCollection;