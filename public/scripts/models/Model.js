define([
    'jQuery'
], function (
    $
) {
    "use strict";

    var Model = function () {

        this._properties = {};

        this._eventDispatcher = $({});

    };

    Model.EVENTS = {
        CHANGE: 'change'
    };

    Model.prototype.get = function (property) {
        return this._properties[property];
    };

    Model.prototype.set = function () {
        var property = '';
        if (arguments[0].constructor === Object) {
            var setterObject = arguments[0];
            var propertiesChanged = [];
            for (property in setterObject) {
                this.set(property, setterObject[property]);
            }
            return this;
        }

        property = arguments[0];
        var value = arguments[1];

        if (this._properties[property] !== undefined) {
            this._properties[property] = value;

            var evt = $.Event(Model.EVENTS.CHANGE, { property: property });
            this.trigger(evt);
        }

        return this;
    };

    Model.prototype.trigger = function () {
        this._eventDispatcher.trigger.apply(this._eventDispatcher, arguments);
    };

    Model.prototype.on = function () {
        this._eventDispatcher.on.apply(this._eventDispatcher, arguments);
    };

    Model.prototype.off = function () {
        this._eventDispatcher.off(this._eventDispatcher, arguments);
    };


    return Model;
});