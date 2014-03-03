function Candle () {

    this.timestamp = 0;

    this.openBid = 0.00;

    this.openAsk = 0.00;

    this.closeBid = 0.00;

    this.closeAsk = 0.00;

    this.highBid = 0.00;

    this.highAsk = 0.00;

    this.lowBid = 0.00;

    this.lowAsk = 0.00;

}


Candle.prototype.fromJSON = function (json) {
    this.timestamp = new Date(json.time).getTime();
    this.openBid = json.openBid;
    this.openAsk = json.openAsk;
    this.closeBid = json.closeBid;
    this.closeAsk = json.closeAsk;
    this.highBid = json.highBid;
    this.highAsk = json.highAsk;
    this.lowBid = json.lowBid;
    this.lowAsk = json.lowAsk;
    return this;
}


module.exports = Candle;
