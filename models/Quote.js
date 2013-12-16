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


Quote.prototype.fromArray = function (array) {
    var date = array[0];
    date = date.slice(0,4) + '/' + date.slice(4,6) + '/' + date.slice(6,8) + date.slice(8,11) + ':' + date.slice(11, 13) + ':' + date.slice(13, 15) + '.' + date.slice(15);
    this.time = new Date(date).getTime();
    this.bid = array[1];
    this.ask = array[2];
    return this;
}

module.exports = Quote;
