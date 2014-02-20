var PubSub = require('./PubSub.js');


function Observer () {

    this.subjects = [];

    this.onEvent = this.onEvent.bind(this);

}
Observer.prototype = new PubSub();
Observer.prototype.constructor = Observer;


Observer.prototype.observe = function (subjects) {
    if (subjects instanceof Array === false) {
        return this.observe([ subjects ]);
    }
    subjects.forEach(function (subject) {
        subject.subscribe('*', this.onEvent);
        this.subjects.push(subject);
    }, this);
    return this;
};


Observer.prototype.onEvent = function (e) {
    this.subjects.forEach(function (subject) {
        if (subject !== e.target) {
            subject.forward(e);
        }
    });
};

module.exports = Observer;
