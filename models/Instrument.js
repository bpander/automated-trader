var Eventable = require('../lib/Eventable');
var Graph = require('./Graph');


function Instrument (base, counter) {
    Eventable.call(this);

    this.base = base;

    this.counter = counter;

    this.graphs = [];

    this._onTick = this._onTick.bind(this);

}
Instrument.prototype = new Eventable();
Instrument.prototype.constructor = Instrument;


Instrument.prototype.createGraph = function (granularity, type) {
    var graph = Graph.create(this, granularity, type);
    this.graphs.push(graph);
    this.on('tick', this._onTick);
    return graph;
};


Instrument.prototype.toString = function () {
    return this.base + '_' + this.counter;
};


Instrument.prototype._onTick = function (e) {
    this.graphs.forEach(function (graph) {
        graph.addTick(e.data);
    });
};


module.exports = Instrument;