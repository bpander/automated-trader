var Q = require('q');
var Util = require('./lib/Util');
var mysql = require('mysql');
var HighLowStrategy = require('./strategies/HighLowStrategy');
var Graph = require('./models/Graph');
var SETTINGS = require('./SETTINGS');

var globalStart = new Date('1 Jan 2014 EST');
var highLowStrategy = new HighLowStrategy();
var connection = mysql.createConnection(SETTINGS.MYSQL);

highLowStrategy.createGraphs().then(function (graphCollection) {
    return Q.all(graphCollection.map(function (graphs) {
        return Q.all(graphs.map(function (graph) {
            var dfd = Q.defer();
            var start = new Date(globalStart.getTime());
            var tableName = graph.instrument.toString() + '_' + graph.granularity;
            var query = 'CREATE TABLE IF NOT EXISTS ' + tableName + ' ( time varchar(64), openBid float, openAsk float, closeBid float, closeAsk float, highBid float, highAsk float, lowBid float, lowAsk float )';
            graph.stop();
            Util.log('Making table', tableName);
            connection.query(query, function (error) {
                if (error) {
                    dfd.reject(error);
                    return;
                }
                Util.log('Table', tableName, 'made');
                Util.log('Fetching history for', tableName);
                var accumulateData = function () {
                    graph.fetchHistory({ count: 5000, start: start.toISOString() }).then(function (response) {
                        if (response.candles.length === 0) {
                            dfd.resolve();
                            return;
                        }
                        var lastCandle;
                        var insertCandles = function () {
                            var insertCandlesDfd = Q.defer();
                            var insertCandle = function () {
                                var candle = response.candles.shift();
                                if (candle === undefined) {
                                    insertCandlesDfd.resolve();
                                    return;
                                }
                                var query = 'INSERT INTO ' + tableName + ' VALUES ("' + candle.time + '", ' + [candle.openBid, candle.openAsk, candle.closeBid, candle.closeAsk, candle.highBid, candle.highAsk, candle.lowBid, candle.lowAsk].join(', ') + ')';
                                connection.query(query, function (error) {
                                    if (error) {
                                        insertCandlesDfd.reject(error);
                                        return;
                                    }
                                    Util.log('Added candle', candle.time, 'to', tableName);
                                    lastCandle = candle;
                                    insertCandle();
                                });
                            };
                            insertCandle();
                            return insertCandlesDfd.promise;
                        };
                        insertCandles().then(function () {
                            start = new Date(new Date(lastCandle.time).getTime() + Graph.INTERVAL[graph.granularity]);
                            accumulateData();
                        });
                    });
                };
                accumulateData();
            });
            return dfd.promise;
        }));
    })).then(function () {
        Util.log('All tables made');
        connection.destroy();
    }, function (error) {
        Util.error(error);
    });
});
