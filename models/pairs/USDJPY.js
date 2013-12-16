var Pair = require('./Pair.js');

function USDJPY () {
    Pair.call(this);

    this.base = 'USD';

    this.counter = 'JPY';

    this.pip = 0.01;

    this.spread = this.pip * 4;

}
USDJPY.prototype = new Pair();
USDJPY.prototype.constructor = USDJPY;

module.exports = USDJPY;