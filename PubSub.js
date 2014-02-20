function PubSub () {

    this._events = {};

}


PubSub.prototype.subscribe = function (topic, callback) {
    if (this._events[topic] === undefined) {
        this._events[topic] = [];
    }
    this._events[topic].push(callback);
    return this;
};


PubSub.prototype.unsubscribe = function (topic, callback) {
    var callbacks = this._events[topic];
    var index;
    if (callbacks instanceof Array) {
        index = callbacks.indexOf(callback);
        if (index !== -1) {
            callback.splice(index, 1);
        }
    }
    return this;
};


PubSub.prototype.publish = function (topic, data) {
    var callbacks = this._events[topic];
    if (callbacks instanceof Array) {
        callbacks.forEach(function (callback) {
            callback({
                target: this,
                topic: topic,
                data: data
            });
        }, this);
    }
    return this;
};


module.exports = PubSub;