var Util = {};


Util.log = function () {
    console.log.apply(console, arguments);
};


Util.error = function () {
    console.error.apply(console, arguments);
};


module.exports = Util;
