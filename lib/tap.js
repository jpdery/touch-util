"use strict"

var map               = require('weakmap')()
var defineCustomEvent = require('event-util/lib/define-custom-event')

var onDispatch = function(custom, data) {
	custom.view = data.view
	custom.touches = data.touches
	custom.targetTouches = data.targetTouches
	custom.changedTouches = data.changedTouches
	custom.ctrlKey = data.ctrlKey
	custom.shiftKey = data.shiftKey
	custom.altKey = data.altKey
	custom.metaKey = data.metaKey
}

var is = function(parent, node) {
	return parent === node || parent.contains(node)
}

var inside = function(x, y, node) {
	var element = document.elementFromPoint(x, y)
	if (element) return is(node, element)
	return false
}

var outside = function(x, y, node) {
	var element = document.elementFromPoint(x, y)
	if (element) return !is(node, element)
	return true
}

var append = function(parent, object) {
	var merge = {}
	for (var k in parent) merge[k] = parent[k]
	for (var k in object) merge[k] = object[k]
	return merge
}

var custom = {onDispatch: onDispatch}

defineCustomEvent('tapstart', append(custom, {
	base: 'touchstart',
	condition: function(e) {
		return e.targetTouches.length === 1
	}
}))

defineCustomEvent('tapmove', append(custom, {
	base: 'touchmove',
	condition: function(e) {
		return e.targetTouches[0] === e.changedTouches[0]
	}
}))

defineCustomEvent('tapend', append(custom, {
	base: 'touchend',
	condition: function(e) {
		return e.targetTouches.length === 0
	}
}))

defineCustomEvent('tapcancel', append(custom, {
	base: 'touchcancel',
	condition: function(e) {
		return true
	}
}))

defineCustomEvent('tap', append(custom, {
	base: 'tapend',
	condition: function(e) {
		var touch = e.changedTouches[0];
		return inside(touch.pageX, touch.pageY, this)
	}
}))

defineCustomEvent('tapinside', append(custom, {
	base: 'tapmove',
	condition: function(e) {
		var touch = e.targetTouches[0];
		return inside(touch.pageX, touch.pageY, this)
	}
}))

defineCustomEvent('tapoutside', append(custom, {
	base: 'tapmove',
	condition: function(e) {
		var touch = e.targetTouches[0];
		return outside(touch.pageX, touch.pageY, this)
	}
}))

var attach = function(name, func) {
	return function() {
		this.addEventListener(name, func)
	}
}

var detach = function(name, func) {
	return function() {
		this.removeEventListener(name, func)
	}
}

var storage = function(element, touch) {
	var data = map.get(element)
	if (!data) map.set(element, (data = {}))
	return data
}

var enters = function(element, touch) {
	var data = storage(element)
	var name = touch.identifier
	if (data[name] === undefined ||
		data[name] === 'out') {
		data[name] = 'in'
		return true
	}
	return false
}

var leaves = function(element, touch) {
	var data = storage(element)
	var name = touch.identifier
	if (data[name] === undefined ||
		data[name] === 'in') {
		data[name] = 'out'
		return true
	}
	return false
}

var enter = function(e) {
	this.dispatchEvent('tapenter', e)
}

var leave = function(e) {
	this.dispatchEvent('tapleave', e)
}

defineCustomEvent('tapenter', append(custom, {
	base: 'tapinside',
	condition: function(e) {
		return enters(this, e.targetTouches[0])
	},
	onAdd: attach('tapstart', enter),
	onRemove: detach('tapstart', enter)
}))

defineCustomEvent('tapleave', append(custom, {
	base: 'tapoutside',
	condition: function(e) {
		return leaves(this, e.targetTouches[0])
	},
	onAdd: attach('tapend', leave),
	onRemove: detach('tapend', leave)
}))
