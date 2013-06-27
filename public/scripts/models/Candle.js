define([
], function (
) {
    "use strict";

    var Candle = function () {

        this.time = 0;

        this.highMid = 0;

        this.lowMid = 0;

        this.openMid = 0;

        this.closeMid = 0;

        this.complete = false;

    };

    Candle.prototype.fromJSON = function (jsonObject) {
        var prop = '';
        for (prop in jsonObject) {
            if (prop === 'complete') {
                this.complete = jsonObject.complete === 'true' || jsonObject.complete === true;
                continue;
            }
            if (this.hasOwnProperty(prop)) {
                this[prop] = jsonObject[prop];
            }
        }

        return this;
    };

    Candle.prototype.isBull = function () {
        return this.closeMid > this.openMid;
    };


    return Candle;
});