function Quote () {

    this.instrument = '';

    this.time = 0;

    this.bid = 0.000;

    this.ask = 0.000;

}

Quote.prototype.fromJSON = function (json) {
    this.instrument = json.instrument;
    this.time = new Date(json.time).getTime();
    this.bid = json.bid;
    this.ask = json.ask;

    return this;
};

module.exports = Quote;
