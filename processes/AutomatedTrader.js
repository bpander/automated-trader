var Eventable = require('../lib/Eventable');
var HighLowStrategy = require('../strategies/HighLowStrategy');
var Q = require('Q');


function AutomatedTrader () {
    Eventable.call(this);

    this.strategies = [
        new HighLowStrategy()
    ];

}
AutomatedTrader.prototype = new Eventable();
AutomatedTrader.prototype.constructor = AutomatedTrader;


AutomatedTrader.prototype.start = function () {

};


/**
 * @method  backTest
 * @description  Test the AutomatedTrader using historical data
 * @param  {String[]}   currencyPairs   An array of currency pairs in the form [ 'EUR/USD', ... ]
 * @param  {Date}       start           Gather data from this point
 * @param  {Date}       end             Gather data to this point
 * @return {Q.Promise}  A promise that gets resolved when the back testing is complete
 */
AutomatedTrader.prototype.backTest = function (currencyPairs, start, end) {
    var dfd = Q.defer();
    return dfd.promise;
};


module.exports = AutomatedTrader;
