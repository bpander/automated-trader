function InstrumentCollection (models) {

    this.socket = null;

    this.models = models;

    this.strategyCollection = [];

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


InstrumentCollection.prototype.getHistoricalData = function (start, end) {

};


InstrumentCollection.prototype.applyStrategies = function (strategyCollection) {
    this.models.forEach(function (model) {
        strategyCollection.forEach(function (strategy) {
            strategy.tools.forEach(function (tool) {
                model.addTool(tool);
            });
        });
    });
    return this;
};


InstrumentCollection.prototype._onTick = function (data) {

};


module.exports = InstrumentCollection;