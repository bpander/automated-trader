define([
    'jQuery',
    'handlebars'
], function (
    $,
    Handlebars
) {
    "use strict";

    var View = function (model) {

        this.model = model;

        this.element = null;

    };

    View.prototype.render = function (context) {
        var source = this.element.outerHTML;
        var template = Handlebars.compile(source);
        console.log('rendering...', template(context));
    };


    return View;
});