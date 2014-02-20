function Eventable () {

    this.events = {};

}


Eventable.prototype.on = function (eventName, callback) {
    if (this.events[eventName] === undefined) {
        this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
    return this;
};


Eventable.prototype.off = function (eventName, callback) {
    var callbacks = this.events[eventName];
    var index;
    if (callbacks instanceof Array) {
        index = callbacks.indexOf(callback);
        if (index !== -1) {
            callback.splice(index, 1);
        }
    }
    return this;
};


Eventable.prototype.trigger = function (eventName, data) {
    var event = arguments[0] instanceof Event ? arguments[0] : new Event(eventName, data, this);
    var callbacks = this.events[event.name] || [];
    var wildcards = this.events['*'] || [];
    event.currentTarget = this;
    callbacks.concat(wildcards).forEach(function (callback) {
        callback(event);
    });
    return this;
};



function Event (name, data, target) {

    this.name = name;

    this.data = data;

    this.target = target;

    this.currentTarget = null;

}


module.exports = Eventable;