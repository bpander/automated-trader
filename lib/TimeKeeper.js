var cron = require('cron');

var TimeKeeper = {

    cronJobs: []

};


var _virtualTime;


TimeKeeper.now = function () {
    if (_virtualTime === undefined) {
        return Date.now();
    }
    return _virtualTime;
};


TimeKeeper.setVirtualTime = function (virtualTime) {
    _virtualTime = virtualTime;
    return this;
};


TimeKeeper.simulateTime = function (start, end) {
    var startTime = start.getTime();
    var endTime = end.getTime();
    var virtualDate;
    this.setVirtualTime(startTime);
    this.cronJobs.forEach(function (cronJob) {
        cronJob.stop();
    });
    _virtualTime = _virtualTime - 1000;
    while ((_virtualTime = _virtualTime + 1000) < endTime) {
        virtualDate = new Date(_virtualTime);
        this.cronJobs.forEach(function (cronJob) {
            var cronTime = cronJob.cronTime;
            if (
                virtualDate.getSeconds() in cronTime.second &&
                virtualDate.getMinutes() in cronTime.minute &&
                virtualDate.getHours() in cronTime.hour &&
                virtualDate.getDay() in cronTime.dayOfWeek &&
                virtualDate.getDate() in cronTime.dayOfMonth &&
                virtualDate.getMonth() in cronTime.month
            ) {
                cronJob._callback();
            }
        });
    }
};


TimeKeeper.createJob = function (options) {
    var cronJob = new cron.CronJob(options);
    this.cronJobs.push(cronJob);
    return cronJob;
};


module.exports = TimeKeeper;
