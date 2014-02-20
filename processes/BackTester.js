var Eventable = require('../Eventable.js');

function BackTester () {
    Eventable.call(this);
}
BackTester.prototype = new Eventable();
BackTester.prototype.constructor = BackTester;


BackTester.prototype.start = function () {

};


module.exports = BackTester;
