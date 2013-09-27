function Candle () {

    this.complete; //"true"

    this.highMid; //93.18

    this.lowMid; //92.207

    this.openMid; //93.141

    this.closeMid; //92.38

    this.time; //1359972000

}

Candle.prototype.fromJSON = function (json) {
    this.closeMid = json.closeMid;
    this.complete = json.complete || json.complete === 'true';
    this.highMid = json.highMid;
    this.lowMid = json.lowMid;
    this.time = new Date(json.time * 1000);

    return this;
};

Candle.prototype.isInside = function (candle) {
    if (candle instanceof Candle === false) {
        return false;
    }
    return this.lowMid > candle.lowMid && this.highMid < candle.highMid;
};

module.exports = Candle;