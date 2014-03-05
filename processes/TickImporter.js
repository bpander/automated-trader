var fs = require('fs');
var SETTINGS = require('../SETTINGS');
var csv = require('csv');
var mysql = require('mysql');
var Q = require('Q');


function TickImporter() {

    this.connection = null;

}


var CONFIG = {
    RAW_DATA_FOLDER: 'history/'
};


var _formatDate = function (dateString) {
    var year = dateString.slice(0, 4);
    var month = dateString.slice(4, 6);
    var day = dateString.slice(6, 8);
    var hour = dateString.slice(9, 11);
    var minute = dateString.slice(11, 13);
    var second = dateString.slice(13, 15);
    var millisecond = dateString.slice(15);
    return new Date([month, day, year].join('/') + ' ' + [hour, minute, second].join(':') + '.' + millisecond + ' EST').getTime();
};


TickImporter.prototype.start = function () {
    var self = this;

    this.connection = mysql.createConnection({
        host: SETTINGS.MYSQL_HOST,
        port: SETTINGS.MYSQL_PORT,
        user: SETTINGS.MYSQL_USER,
        password: SETTINGS.MYSQL_PASSWORD,
        database: SETTINGS.MYSQL_DATABASE
    });

    return fs.readdirSync(CONFIG.RAW_DATA_FOLDER).reduce(function (previous, current) {
        return previous.then(function () {
            var fileExt = current.split('.').pop().toLowerCase();
            if (fileExt !== 'csv') {
                return;
            }
            var instrument = current.split('_')[2];
            var dfd = Q.defer();
            console.log('Fetching', current);
            instrument = instrument.slice(0, 3) + '/' + instrument.slice(3);
            csv().from.path(CONFIG.RAW_DATA_FOLDER + current).to.array(function (data) {
                console.log('Got', current);
                self.import(instrument, data).then(dfd.resolve, dfd.reject);
            });
            return dfd.promise;
        });
    }, Q()).then(self.connection.end.bind(self.connection)).fail(self.connection.end.bind(self.connection));
};


TickImporter.prototype.import = function (instrument, data) {
    var self = this;
    var dfd = Q.defer();
    var i = 0;
    var l = data.length;
    var insertRow = function () {
        var statement = '';
        var row = data[i];
        var values = [];
        values[0] = '"' + instrument + '"';
        values[1] = _formatDate(row[0]);
        values[2] = row[1];
        values[3] = row[2];
        self.connection.query('INSERT INTO ticks VALUES (' + values.join(', ') + ')', function (error, response) {
            if (error) {
                console.error('ERROR: ', error);
                dfd.reject();
                return;
            }
            i++;
            if (i !== l) {
                insertRow();
            } else {
                clearInterval(intervalId);
                dfd.resolve();
                console.log('Import complete');
            }
        });
    };
    var logStatus = function () {
        console.log('Completed', i / l * 100 + '%');
    };
    var intervalId = setInterval(logStatus, 1000);
    console.log('Starting import of', l, 'ticks');
    insertRow();
    return dfd.promise;
};


module.exports = TickImporter;
