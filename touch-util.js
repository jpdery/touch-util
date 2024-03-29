(function(modules) {
    var cache = {}, require = function(id) {
        var module = cache[id];
        if (!module) {
            module = cache[id] = {};
            var exports = module.exports = {};
            modules[id].call(exports, require, module, exports, window);
        }
        return module.exports;
    };
    window["touch-util"] = require("0");
})({
    "0": function(require, module, exports, global) {
        "use strict";
        require("1");
        require("2");
    },
    "1": function(require, module, exports, global) {
        "use strict";
        var hasTouchEvent = "ontouchstart" in global;
        var hasTouchList = "TouchList" in global;
        var hasTouch = "Touch" in global;
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
            var Touch = function() {};
        }
        var touch = null;
        var target = null;
        var onDocumentMouseDown = function(e) {
            if (target === null) {
                target = e.target;
                touch = new Touch;
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
                var list = new TouchList;
                list.length = 1;
                list[0] = touch;
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("touchstart", true, true);
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
                var list = new TouchList;
                list.length = 1;
                list[0] = touch;
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("touchmove", true, true);
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
                var list = new TouchList;
                list.length = 1;
                list[0] = touch;
                var event = document.createEvent("CustomEvent");
                event.initCustomEvent("touchend", true, true);
                event.touches = new TouchList;
                event.targetTouches = new TouchList;
                event.changedTouches = list;
                target.dispatchEvent(event);
                target = null;
            }
        };
        if (!hasTouchEvent) {
            document.addEventListener("mousedown", onDocumentMouseDown);
            document.addEventListener("mousemove", onDocumentMouseMove);
            document.addEventListener("mouseup", onDocumentMouseUp);
        }
    },
    "2": function(require, module, exports, global) {
        "use strict";
        var map = require("3")();
        var defineCustomEvent = require("4");
        var onDispatch = function(custom, data) {
            custom.view = data.view;
            custom.touches = data.touches;
            custom.targetTouches = data.targetTouches;
            custom.changedTouches = data.changedTouches;
            custom.ctrlKey = data.ctrlKey;
            custom.shiftKey = data.shiftKey;
            custom.altKey = data.altKey;
            custom.metaKey = data.metaKey;
        };
        var is = function(parent, node) {
            return parent === node || parent.contains(node);
        };
        var inside = function(x, y, node) {
            var element = document.elementFromPoint(x, y);
            if (element) return is(node, element);
            return false;
        };
        var outside = function(x, y, node) {
            var element = document.elementFromPoint(x, y);
            if (element) return !is(node, element);
            return true;
        };
        var append = function(parent, object) {
            var merge = {};
            for (var k in parent) merge[k] = parent[k];
            for (var k in object) merge[k] = object[k];
            return merge;
        };
        var attach = function(name, func) {
            return function() {
                this.addEventListener(name, func);
            };
        };
        var detach = function(name, func) {
            return function() {
                this.removeEventListener(name, func);
            };
        };
        var storage = function(element, touch) {
            var data = map.get(element);
            if (!data) map.set(element, data = {});
            return data;
        };
        var enters = function(element, touch) {
            var data = storage(element);
            var name = touch.identifier;
            if (data[name] === undefined || data[name] === "out") {
                data[name] = "in";
                return true;
            }
            return false;
        };
        var leaves = function(element, touch) {
            var data = storage(element);
            var name = touch.identifier;
            if (data[name] === undefined || data[name] === "in") {
                data[name] = "out";
                return true;
            }
            return false;
        };
        var enter = function(e) {
            this.dispatchEvent("tapenter", e);
        };
        var leave = function(e) {
            this.dispatchEvent("tapleave", e);
        };
        var custom = {
            onDispatch: onDispatch
        };
        defineCustomEvent("tapstart", append(custom, {
            base: "touchstart",
            condition: function(e) {
                return e.targetTouches.length === 1;
            }
        }));
        defineCustomEvent("tapmove", append(custom, {
            base: "touchmove",
            condition: function(e) {
                return e.targetTouches[0] === e.changedTouches[0];
            }
        }));
        defineCustomEvent("tapend", append(custom, {
            base: "touchend",
            condition: function(e) {
                return e.targetTouches.length === 0;
            }
        }));
        defineCustomEvent("tapcancel", append(custom, {
            base: "touchcancel",
            condition: function(e) {
                return true;
            }
        }));
        defineCustomEvent("tap", append(custom, {
            base: "tapend",
            condition: function(e) {
                var touch = e.changedTouches[0];
                return inside(touch.pageX, touch.pageY, this);
            }
        }));
        defineCustomEvent("tapinside", append(custom, {
            base: "tapmove",
            condition: function(e) {
                var touch = e.targetTouches[0];
                return inside(touch.pageX, touch.pageY, this);
            }
        }));
        defineCustomEvent("tapoutside", append(custom, {
            base: "tapmove",
            condition: function(e) {
                var touch = e.targetTouches[0];
                return outside(touch.pageX, touch.pageY, this);
            }
        }));
        defineCustomEvent("tapenter", append(custom, {
            base: "tapinside",
            condition: function(e) {
                return enters(this, e.targetTouches[0]);
            },
            onAdd: attach("tapstart", enter),
            onRemove: detach("tapstart", enter)
        }));
        defineCustomEvent("tapleave", append(custom, {
            base: "tapoutside",
            condition: function(e) {
                return leaves(this, e.targetTouches[0]);
            },
            onAdd: attach("tapend", leave),
            onRemove: detach("tapend", leave)
        }));
    },
    "3": function(require, module, exports, global) {
        void function(global, undefined_, undefined) {
            var getProps = Object.getOwnPropertyNames, defProp = Object.defineProperty, toSource = Function.prototype.toString, create = Object.create, hasOwn = Object.prototype.hasOwnProperty, funcName = /^\n?function\s?(\w*)?_?\(/;
            function define(object, key, value) {
                if (typeof key === "function") {
                    value = key;
                    key = nameOf(value).replace(/_$/, "");
                }
                return defProp(object, key, {
                    configurable: true,
                    writable: true,
                    value: value
                });
            }
            function nameOf(func) {
                return typeof func !== "function" ? "" : "name" in func ? func.name : toSource.call(func).match(funcName)[1];
            }
            var Data = function() {
                var dataDesc = {
                    value: {
                        writable: true,
                        value: undefined
                    }
                }, datalock = "return function(k){if(k===s)return l}", uids = create(null), createUID = function() {
                    var key = Math.random().toString(36).slice(2);
                    return key in uids ? createUID() : uids[key] = key;
                }, globalID = createUID(), storage = function(obj) {
                    if (hasOwn.call(obj, globalID)) return obj[globalID];
                    if (!Object.isExtensible(obj)) throw new TypeError("Object must be extensible");
                    var store = create(null);
                    defProp(obj, globalID, {
                        value: store
                    });
                    return store;
                };
                define(Object, function getOwnPropertyNames(obj) {
                    var props = getProps(obj);
                    if (hasOwn.call(obj, globalID)) props.splice(props.indexOf(globalID), 1);
                    return props;
                });
                function Data() {
                    var puid = createUID(), secret = {};
                    this.unlock = function(obj) {
                        var store = storage(obj);
                        if (hasOwn.call(store, puid)) return store[puid](secret);
                        var data = create(null, dataDesc);
                        defProp(store, puid, {
                            value: (new Function("s", "l", datalock))(secret, data)
                        });
                        return data;
                    };
                }
                define(Data.prototype, function get(o) {
                    return this.unlock(o).value;
                });
                define(Data.prototype, function set(o, v) {
                    this.unlock(o).value = v;
                });
                return Data;
            }();
            var WM = function(data) {
                var validate = function(key) {
                    if (key == null || typeof key !== "object" && typeof key !== "function") throw new TypeError("Invalid WeakMap key");
                };
                var wrap = function(collection, value) {
                    var store = data.unlock(collection);
                    if (store.value) throw new TypeError("Object is already a WeakMap");
                    store.value = value;
                };
                var unwrap = function(collection) {
                    var storage = data.unlock(collection).value;
                    if (!storage) throw new TypeError("WeakMap is not generic");
                    return storage;
                };
                var initialize = function(weakmap, iterable) {
                    if (iterable !== null && typeof iterable === "object" && typeof iterable.forEach === "function") {
                        iterable.forEach(function(item, i) {
                            if (item instanceof Array && item.length === 2) set.call(weakmap, iterable[i][0], iterable[i][1]);
                        });
                    }
                };
                function WeakMap(iterable) {
                    if (this === global || this == null || this === WeakMap.prototype) return new WeakMap(iterable);
                    wrap(this, new Data);
                    initialize(this, iterable);
                }
                function get(key) {
                    validate(key);
                    var value = unwrap(this).get(key);
                    return value === undefined_ ? undefined : value;
                }
                function set(key, value) {
                    validate(key);
                    unwrap(this).set(key, value === undefined ? undefined_ : value);
                }
                function has(key) {
                    validate(key);
                    return unwrap(this).get(key) !== undefined;
                }
                function delete_(key) {
                    validate(key);
                    var data = unwrap(this), had = data.get(key) !== undefined;
                    data.set(key, undefined);
                    return had;
                }
                function toString() {
                    unwrap(this);
                    return "[object WeakMap]";
                }
                try {
                    var src = ("return " + delete_).replace("e_", "\\u0065"), del = (new Function("unwrap", "validate", src))(unwrap, validate);
                } catch (e) {
                    var del = delete_;
                }
                var src = ("" + Object).split("Object");
                var stringifier = function toString() {
                    return src[0] + nameOf(this) + src[1];
                };
                define(stringifier, stringifier);
                var prep = {
                    __proto__: []
                } instanceof Array ? function(f) {
                    f.__proto__ = stringifier;
                } : function(f) {
                    define(f, stringifier);
                };
                prep(WeakMap);
                [ toString, get, set, has, del ].forEach(function(method) {
                    define(WeakMap.prototype, method);
                    prep(method);
                });
                return WeakMap;
            }(new Data);
            var defaultCreator = Object.create ? function() {
                return Object.create(null);
            } : function() {
                return {};
            };
            function createStorage(creator) {
                var weakmap = new WM;
                creator || (creator = defaultCreator);
                function storage(object, value) {
                    if (value || arguments.length === 2) {
                        weakmap.set(object, value);
                    } else {
                        value = weakmap.get(object);
                        if (value === undefined) {
                            value = creator(object);
                            weakmap.set(object, value);
                        }
                    }
                    return value;
                }
                return storage;
            }
            if (typeof module !== "undefined") {
                module.exports = WM;
            } else if (typeof exports !== "undefined") {
                exports.WeakMap = WM;
            } else if (!("WeakMap" in global)) {
                global.WeakMap = WM;
            }
            WM.createStorage = createStorage;
            if (global.WeakMap) global.WeakMap.createStorage = createStorage;
        }((0, eval)("this"));
    },
    "4": function(require, module, exports, global) {
        "use strict";
        var storage = require("3").createStorage();
        var customs = {};
        var dispatchEvent = Element.prototype.dispatchEvent;
        var addEventListener = Element.prototype.addEventListener;
        var removeEventListener = Element.prototype.removeEventListener;
        Element.prototype.dispatchEvent = function(event, data) {
            var custom = customs[event];
            if (custom) {
                data = data || {};
                if (fail(custom.condition, this, data)) return;
                var name = event;
                event = document.createEvent("CustomEvent");
                event.initCustomEvent(name, custom.bubbleable, custom.cancelable);
                custom.onDispatch.call(this, event, data);
            }
            return dispatchEvent.call(this, event);
        };
        Element.prototype.addEventListener = function(type, listener, capture) {
            var custom = customs[type];
            if (custom) {
                custom.onAdd.call(this);
                listener = validate(this, type, listener);
                var name = root(custom);
                if (name) addEventListener.call(this, name, dispatch(this, type, listener), capture);
            }
            return addEventListener.call(this, type, listener, capture);
        };
        Element.prototype.removeEventListener = function(type, listener, capture) {
            var custom = customs[type];
            if (custom) {
                custom.onRemove.call(this);
                listener = validate(this, type, listener);
                var name = root(custom);
                if (name) removeEventListener.call(this, name, dispatch(this, type, listener), capture);
                detach(this, type, listener);
            }
            return removeEventListener.call(this, type, listener, capture);
        };
        var defineCustomEvent = function(name, custom) {
            custom.base = "base" in custom ? custom.base : null;
            custom.condition = "condition" in custom ? custom.condition : true;
            custom.bubbleable = "bubbleable" in custom ? custom.bubbleable : true;
            custom.cancelable = "cancelable" in custom ? custom.cancelable : true;
            custom.onAdd = custom.onAdd || function() {};
            custom.onRemove = custom.onRemove || function() {};
            custom.onDispatch = custom.onDispatch || function() {};
            var base = customs[custom.base];
            var condition = function(e) {
                return pass(base.condition, this, e) && pass(custom.condition, this, e);
            };
            customs[name] = base ? {
                base: base.base,
                bubbleable: custom.bubbleable,
                cancelable: custom.cancelable,
                condition: condition,
                onAdd: inherit(custom, base, "onAdd"),
                onRemove: inherit(custom, base, "onRemove"),
                onDispatch: inherit(custom, base, "onDispatch")
            } : custom;
        };
        var inherit = function(custom, base, method) {
            return function() {
                base[method].apply(this, arguments);
                custom[method].apply(this, arguments);
            };
        };
        var root = function(custom) {
            var base = custom.base;
            if (base === null) return null;
            var parent = customs[base];
            if (parent) return root(parent);
            return base;
        };
        var pass = function(condition, element, e) {
            return typeof condition === "function" ? condition.call(element, e) : condition;
        };
        var fail = function(condition, element, e) {
            return !pass(condition, element, e);
        };
        var handler = function(element, type, listener) {
            var events = storage(element);
            if (events[type] === undefined) {
                events[type] = [];
            }
            events = events[type];
            for (var i = 0, l = events.length; i < l; i++) {
                var event = events[i];
                if (event.listener === listener) return event;
            }
            event = events[events.length] = {
                dispatch: null,
                validate: null,
                listener: listener
            };
            return event;
        };
        var detach = function(element, type, listener) {
            var events = storage(element);
            if (events[type] === undefined) return;
            events = events[type];
            for (var i = 0, l = events.length; i < l; i++) {
                var event = events[i];
                if (event.listener === listener) {
                    events.splice(i, 1);
                }
            }
            return event;
        };
        var dispatch = function(element, type, listener) {
            var event = handler(element, type, listener);
            if (event.dispatch === null) {
                event.dispatch = function(e) {
                    element.dispatchEvent(type, e);
                };
            }
            return event.dispatch;
        };
        var validate = function(element, type, listener) {
            var event = handler(element, type, listener);
            if (event.validate === null) {
                event.validate = function(e) {
                    if (e instanceof CustomEvent) listener.call(this, e);
                };
            }
            return event.validate;
        };
        module.exports = global.defineCustomEvent = defineCustomEvent;
    }
});
