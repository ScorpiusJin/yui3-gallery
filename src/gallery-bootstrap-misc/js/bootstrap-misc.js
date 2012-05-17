/**

For all the small controls that Twitter Bootstrap has that don't warrant a
full module, we have Bootstrap Misc!

@module gallery-bootstrap-misc
**/

/**
@class Bootstrap
**/

// We must extend Y.Widget to have extra class names.
Y.Widget.ATTRS.classNames = {
	valueFn: function () {
		return [];
	}
};

Y.mix(Y.Widget.prototype, {
	_addExtraClassNames: function () {
		var boundingBox = this.get('boundingBox');
		Y.Array.each(this.get('classNames'), function (className) {
			boundingBox.addClass(className);
		}, this);
	},
	_renderUI: function() {
		this._renderBoxClassNames();
		this._addExtraClassNames();
		this._renderBox(this._parentNode);
	},
	toggleView: function () {
		return this.set('visible', !this.get('visible'));
	}
}, true);


var NS = Y.namespace('Bootstrap');

