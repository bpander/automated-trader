'use strict';

var Oanda = require('./Oanda');


var COUNT = 5000;
var SAMPLE_SIZE = 10;
var OUTCOME_SIZE = 5;
var THRESHOLD = 0.05;

var EMA = function (numbers) {
    numbers = numbers.slice(0);
    var ema = numbers.shift();
    var weight = 0.75;
    numbers.forEach(function (number) {
        ema = weight * number + (1 - weight) * ema;
    });
    return ema;
};


function Pattern (movements) {

    this.movements = movements;

    this.pipMovement = 0;

    this.repeats = 0;

    this.averageMovement = 0;

}


Pattern.prototype.percentDiff = function (pattern) {
    return EMA(this.movements.map(function (movement, i) {
        var base = Math.abs(movement);
        var counter = Math.abs(pattern.movements[i]);
        var max = base;
        var min = counter;
        if (counter > base) {
            max = counter;
            min = base;
        }
        return max === 0 ? 0 : (max - min) / max;
    }));
};



Oanda.request({
    qs: {
        instrument: 'GBP_USD',
        granularity: 'M1',
        count: COUNT,
        candleFormat: 'midpoint'
    }
}).then(function (response) {

    var patterns = [];
    var numPatternsPassed = 0;
    var candlesSubset;
    var candlesSubsetInitial;
    var pattern;
    var candlesCounter;
    var candlesCounterInitial;
    var patternCounter;
    var percentDiff;
    var candlesLearn = response.candles.splice(0, COUNT / 2);
    var candlesTest = response.candles;
    var i = 0;
    var j = 0;
    var l = candlesLearn.length - SAMPLE_SIZE - OUTCOME_SIZE;
    for (; i !== l; i++) {
        candlesSubset = candlesLearn.slice(i, i + SAMPLE_SIZE);
        candlesSubsetInitial = candlesSubset[0].closeMid;
        pattern = new Pattern(candlesSubset.map(function (candle) {
            return candle.closeMid - candlesSubsetInitial;
        }));
        pattern.pipMovement = candlesLearn[i + SAMPLE_SIZE + OUTCOME_SIZE].closeMid - candlesLearn[j + SAMPLE_SIZE].closeMid;
        for (j = 0; j !== l; j++) {
            candlesCounter = candlesLearn.slice(j, j + SAMPLE_SIZE);
            candlesCounterInitial = candlesCounter[0].closeMid;
            patternCounter = new Pattern(candlesCounter.map(function (candle) {
                return candle.closeMid - candlesCounterInitial;
            }));
            percentDiff = pattern.percentDiff(patternCounter);
            if (percentDiff < THRESHOLD && percentDiff !== 0) {
                if (patterns.indexOf(pattern) === -1) {
                    patterns.push(pattern);
                }
                pattern.repeats++;
                pattern.pipMovement = pattern.pipMovement + (candlesLearn[j + SAMPLE_SIZE + OUTCOME_SIZE].closeMid - candlesLearn[j + SAMPLE_SIZE].closeMid);
                pattern.averageMovement = pattern.pipMovement / pattern.repeats;
            }
        }
    }

    var patternWinner = patterns.sort(function (a, b) {
        return Math.abs(b.pipMovement) - Math.abs(a.pipMovement);
    })[0];
    console.log('Found winner:', patternWinner);
    var trades = 0;
    var profit = 0;
    var delta;

    i = 0;
    l = candlesTest.length - SAMPLE_SIZE - OUTCOME_SIZE;
    for (; i !== l; i++) {
        candlesSubset = candlesTest.slice(i, i + SAMPLE_SIZE);
        candlesSubsetInitial = candlesSubset[0].closeMid;
        pattern = new Pattern(candlesSubset.map(function (candle) {
            return candle.closeMid - candlesSubsetInitial;
        }));
        percentDiff = patternWinner.percentDiff(pattern);
        if (percentDiff < THRESHOLD) {
            trades++;
            delta = candlesTest[i + SAMPLE_SIZE + OUTCOME_SIZE].closeMid - candlesTest[i + SAMPLE_SIZE].closeMid;
            if (patternWinner.pipMovement < 0) {
                delta = delta * -1;
            }
            profit = profit + delta;
        }
    }
    console.log('Test finished');
    console.log('Profit:', profit * 10000);
    console.log('Trades:', trades);
    console.log('AveragePL', profit * 10000 / trades);
});
