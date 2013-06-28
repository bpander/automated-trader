var Pair = function (base, counter) {

    this.base = base;

    this.counter = counter;

};

Pair.prototype.toString = function () {
    return this.base + '_' + this.counter;
};

module.exports = Pair;