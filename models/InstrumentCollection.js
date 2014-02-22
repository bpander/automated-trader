var csv = require('csv');
var Q = require('Q');


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
    var dfd = Q.defer();
    csv().from.path('./history/DAT_ASCII_EURUSD_T_201401.csv').to.array(function (data, count) {
        var ticks = data.map(function (row) {
            var timeString = row[0];
            var date = new Date();
            var year = timeString.slice(0, 4);
            var month = timeString.slice(4, 6) - 1;
            var day = timeString.slice(6, 8);
            var hour = timeString.slice(9, 11);
            var minute = timeString.slice(11, 13);
            var second = timeString.slice(13, 15);
            var millisecond = timeString.slice(15);
            return {
                instrument: 'EUR/USD',
                timestamp: Date.UTC(year, month, day, hour, minute, second, millisecond),
                bid: +row[1],
                ask: +row[2]
            };
        });
        dfd.resolve(ticks);
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