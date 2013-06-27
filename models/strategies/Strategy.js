var Strategy = function () {

    this.friendlyName = '';

};

Strategy.prototype.start = function () {
    throw new Error('Method does not have implementation');
};

Strategy.prototype.tick = function (data) {
    throw new Error('Method does not have implementation');
};


module.exports = Strategy;