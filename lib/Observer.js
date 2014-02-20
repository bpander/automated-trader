var Eventable = require('./Eventable.js');


function Observer () {

    this.subjects = [];

    this.onEvent = this.onEvent.bind(this);

}
Observer.prototype = new Eventable();
Observer.prototype.constructor = Observer;


Observer.prototype.observe = function (subjects) {
    if (subjects instanceof Array === false) {
        return this.observe([ subjects ]);
    }
    subjects.forEach(function (subject) {
        subject.on('*', this.onEvent);
        this.subjects.push(subject);
    }, this);
    return this;
};


Observer.prototype.onEvent = function (event) {
    if (event.target !== event.currentTarget) {
        return;
    }
    this.subjects.forEach(function (subject) {
        if (subject !== event.target) {
            subject.trigger(event);
        }
    });
};

module.exports = Observer;
