
var touchevents = 'ontouchstart' in window;
if (touchevents === false) (function() {

var hasTouchEvent = 'ontouchstart' in window;
var hasTouchList  = 'TouchList' in window;
var hasTouch      = 'Touch' in window;

if (!hasTouchEvent) {
	var TouchEvent = function(){};
	TouchEvent.prototype = new CustomEvent();
}

if (!hasTouchList) {

	var TouchList = function() {
		this.length = 0;
	};

	TouchList.prototype.identifiedTouch = function(id) {
		return this[0] && this[0].identifier === id ? this[0] : null;
	};

	TouchList.prototype.item = function(index) {
		return this[index] || null;
	};
}

if (!hasTouch) {
	var Touch = function() {}
}

var touch = null;
var target = null;

var onDocumentMouseDown = function(e) {

	if (target === null) {
		target = e.target;

		touch = new Touch();
		touch.identifier = Date.now();
		touch.screenX = e.screenX;
		touch.screenY = e.screenY;
		touch.clientX = e.clientX;
		touch.clientY = e.clientY;
		touch.pageX = e.pageX;
		touch.pageY = e.pageY;
		touch.radiusX = 0;
		touch.radiusY = 0;
		touch.rotationAngle = 0;
		touch.force = 0;
		touch.target = target;

		var list = new TouchList();
		list.length = 1;
		list[0] = touch;

		var event = new TouchEvent;
		event.initCustomEvent('touchstart', true, true);
		event.touches = list;
		event.targetTouches = list;
		event.changedTouches = list;

		target.dispatchEvent(event);
	}
};

var onDocumentMouseMove = function(e) {

	if (target) {

		touch.screenX = e.screenX;
		touch.screenY = e.screenY;
		touch.clientX = e.clientX;
		touch.clientY = e.clientY;
		touch.pageX = e.pageX;
		touch.pageY = e.pageY;

		var list = new TouchList();
		list.length = 1;
		list[0] = touch;

		var event = new TouchEvent;
		event.initCustomEvent('touchmove', true, true);
		event.touches = list;
		event.targetTouches = list;
		event.changedTouches = list;

		target.dispatchEvent(event);
	}
};

var onDocumentMouseUp = function(e) {

	if (target) {

		touch.screenX = e.screenX;
		touch.screenY = e.screenY;
		touch.clientX = e.clientX;
		touch.clientY = e.clientY;
		touch.pageX = e.pageX;
		touch.pageY = e.pageY;

		var list = new TouchList();
		list.length = 1;
		list[0] = touch;

		var event = new TouchEvent;
		event.initCustomEvent('touchend', true, true);
		event.touches = list;
		event.targetTouches = list;
		event.changedTouches = list;

		target.dispatchEvent(event);
		target = null;
	}
};

document.addEventListener('mousedown', onDocumentMouseDown);
document.addEventListener('mousemove', onDocumentMouseMove);
document.addEventListener('mouseup', onDocumentMouseUp);

defineCustomEvent('touchstart', {
	base: 'mousedown'
});

defineCustomEvent('touchmove', {
	base: 'mousemove'
});

defineCustomEvent('touchend', {
	base: 'mouseup'
});

})();