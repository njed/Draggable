var Draggable = (function () {
'use strict';

var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();

/**
 * Created by ann_wei_li@kingdee.com on 2017/10/9.
 */

/**
 * 绑定事件
 * @param el
 * @param event
 * @param fn
 * @param captureMode
 */
function on(el, event, fn) {
    var captureMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    el.addEventListener(event, fn, captureMode);
}

/**
 * 事件解绑
 * @param el
 * @param event
 * @param fn
 * @param captureMode
 */
function off(el, event, fn) {
    var captureMode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    el.removeEventListener(event, fn, captureMode);
}

/**
 *
 * @param callback
 * @param ms
 * @returns {Function}
 */
function throttle(callback, ms) {
    var args = void 0;
    var _this = void 0;
    return function () {
        if (args === void 0) {
            args = arguments;
            _this = this;
            setTimeout(function () {
                if (args.length === 1) {
                    callback.call(_this, args[0]);
                } else {
                    callback.apply(_this, args);
                }
                args = void 0;
            }, ms);
        }
    };
}

/**
 *
 * @param dst
 * @param src
 * @returns {*}
 */
function extend(dst, src) {
    if (dst && src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dst[key] = src[key];
            }
        }
    }
    return dst;
}



/**
 *
 * @param el
 * @param selector
 * @param ctx
 * @returns {*}
 */
function closest(el, selector, ctx) {
    if (el) {
        ctx = ctx || window.document;

        do {
            if (selector === '>*' && el.parentNode === ctx || _matches(el, selector)) {
                return el;
            }
            /* jshint boss:true */
        } while (el = _getParentOrHost(el));
    }

    return null;
}

/**
 *
 * @param el
 * @param selector
 * @returns {number}
 */
function index(el, selector) {
    var index = 0;

    if (!el || !el.parentNode) {
        return -1;
    }

    while (el && (el = el.previousElementSibling)) {
        if (el.nodeName.toUpperCase() !== 'TEMPLATE' && (selector === '>*' || _matches(el, selector))) {
            index++;
        }
    }

    return index;
}

function find(ctx, tagName, iterator) {
    if (ctx) {
        var list = ctx.getElementsByTagName(tagName);
        var _i = 0;
        var n = list.length;
        if (iterator) {
            for (; _i < n; _i++) {
                iterator(list[_i], _i);
            }
        }
        return list;
    }
    return [];
}

/**
 *
 * @param el
 * @param name
 * @param state
 */
function toggleClass(el, name, state) {
    if (el) {
        if (el.classList) {
            el.classList[state ? 'add' : 'remove'](name);
        } else {
            var className = (' ' + el.className + ' ').replace(/\s+/g, ' ').replace(' ' + name + ' ', ' ');
            el.className = (className + (state ? ' ' + name : '')).replace(/\s+/g, ' ');
        }
    }
}

function css(el, prop, val) {
    var style = el && el.style;
    if (style) {
        if (val === void 0) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                val = document.defaultView.getComputedStyle(el, '');
            } else if (el.currentStyle) {
                val = el.currentStyle;
            }
            return prop === void 0 ? val : val[prop];
        } else {
            if (!(prop in style)) {
                prop = '-webkit-' + prop;
            }
            style[prop] = val + (typeof val === 'string' ? '' : 'px');
        }
    }
}

/**
 * 判断元素是否包含指定的类
 * @param el
 * @param selector
 * @returns {boolean}
 */
function hasClass(el, selector) {
    var className = el.getAttribute && el.getAttribute('class') || '';
    if (el.nodeType === 1 && (' ' + _stripAndCollapse(className) + ' ').indexOf(' ' + selector + ' ') > -1) return true;
    return false;
}

function _stripAndCollapse(value) {
    var tokens = value.match(/[^\x20\t\r\n\f]+/g) || [];
    return tokens.join(' ');
}

function _getParentOrHost(el) {
    var parent = el.host;

    return parent && parent.nodeType ? parent : el.parentNode;
}

function _matches(el, selector) {
    if (el) {
        selector = selector.split('.');

        var tag = selector.shift().toUpperCase();
        var re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g');

        return (tag === '' || el.nodeName.toUpperCase() == tag) && (!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length);
    }

    return false;
}

/**
 * 支持mouse,pointer,drag,touch事件；
 * 根据浏览器具体的支持情况选择相应的事件类型；
 * 以mouse事件为例down,move,enter,leave,up
 * touch无对用的enter，leave事件需特殊处理
 *
 * 每次拖拽设计到相应事件的绑定和结束的事件解绑
 *
 * Created by Administrator on 2017/9/18.
 */

/**
 * EndEvent: {item, from, to, oldIndex, newIndex}
 */
/**
 * 分发事件
 * @param draggable 当前实例
 * @param name 事件名称
 * @param targetEl 目标元素
 * @param fromEl 来源容器元素
 * @param toEl 存放容器元素
 * @param oldIndex 起始位置
 * @param newIndex 结束位置
 * @private
 */
function _dispatchEvent(draggable, rootEl, name, targetEl, fromEl, toEl, oldIndex, newIndex) {
    var evt = document.createEvent('Event');
    var options = draggable.options;
    var onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1);

    evt.initEvent(name, true, true);
    evt.item = targetEl || fromEl;
    evt.clone = draggable.cloneEl;
    evt.from = fromEl;
    evt.to = toEl;
    evt.oldIndex = oldIndex;
    evt.newIndex = newIndex;

    rootEl.dispatchEvent(evt);

    if (options[onName]) {
        options[onName].call(draggable, evt);
    }
}

/**
 * 将对应元素设置成不可拖拽
 * @param el
 * @private
 */
function _disableDraggable(el) {
    el.draggable = false;
}

function _globalDragOver(evt) {
    if (evt.dataTransfer) {
        evt.dataTransfer.dropEffect = 'move';
    }
    evt.preventDefault();
}

/**
 * 获取当前的相对元素，可能为占位符
 * @param x
 * @param y
 * @param dorEl
 * @param dorClass
 * @param relClass
 * @returns {*}
 * @private
 */
function _getRelEl(x, y, dorEl, dorClass, relClass) {
    // document.elementFromPoint(x, y)
    var child = dorEl.firstElementChild;
    while (child) {
        var rect = child.getBoundingClientRect();
        if (rect.top <= y && y <= rect.top + rect.height) {
            if (hasClass(child, dorClass)) {
                // 存在子容器
                //
                var subDorEls = child.getElementsByClassName(dorClass);
                child = subDorEls.length > 0 ? subDorEls[0] : child;
                break;
            }
            return child;
        }
        child = child.nextElementSibling;
    }
    // 不存在相对元素，返回容器元素
    if (!child) return dorEl;
    return _getRelEl(x, y, child, dorClass, relClass);
}

/**
 * 获取当前坐标在相对元素上的方位
 * @param x
 * @param y
 * @param relEl
 * @returns {string} lt,lb,rt,rb
 * @private
 */
function _getPosition(x, y, relEl) {
    var rect = relEl.getBoundingClientRect();
    var position = '';
    if (x < rect.left + rect.width / 2) {
        position = y < rect.top + rect.height / 2 ? 'lt' : 'lb';
    } else {
        position = y < rect.top + rect.height / 2 ? 'rt' : 'rb';
    }
    return position;
}

/**
 * 判断是否进入容器
 * @param x
 * @param y
 * @param container
 * @returns {boolean}
 * @private
 */
function _isEntered(x, y, container) {
    if (container) {
        var rect = container.getBoundingClientRect();
        return rect.left < x && x < rect.left + rect.width && rect.top < y && y < rect.top + rect.height;
    }
    return false;
}

/**
 * 容器自动滚动
 * @param container
 * @param options
 * @param evt
 * @private
 */
var _autoScroll = throttle(function (evt, inst) {
    if (inst && inst.dorEl && inst.options.scroll) {
        var options = inst.options;
        var x = evt.clientX;
        var y = evt.clientY;
        var scrollOffsetX = void 0;
        var scrollOffsetY = void 0;
        var sens = options.scrollSensitivity;
        var scrollCustomFn = options.scrollFn;
        var speed = options.scrollSpeed;
        var rect = inst.dorEl.getBoundingClientRect();
        var vx = void 0;
        var vy = void 0;
        if (inst.dorEl === window) {
            vx = (window.innerWidth - x <= sens) - (x <= sens);
            vy = (window.innerHeight - y <= sens) - (y <= sens);
        } else {
            vx = (Math.abs(rect.right - x) <= sens) - (Math.abs(rect.left - x) <= sens);
            vy = (Math.abs(rect.bottom - y) <= sens) - (Math.abs(rect.top - y) <= sens);
        }

        if (inst.vx !== vx || inst.vy !== vy) {
            inst.vx = vx;
            inst.vy = vy;

            clearInterval(inst.pid);

            inst.pid = setInterval(function () {
                scrollOffsetY = vy ? vy * speed : 0;
                scrollOffsetX = vx ? vx * speed : 0;

                if ('function' === typeof scrollCustomFn) {
                    return scrollCustomFn.call(inst, scrollOffsetX, scrollOffsetY, evt);
                }

                if (inst.dorEl === window) {
                    window.scrollTo(window.pageXOffset + scrollOffsetX, window.pageYOffset + scrollOffsetY);
                } else {
                    inst.dorEl.scrollTop += scrollOffsetY;
                    inst.dorEl.scrollLeft += scrollOffsetX;
                }
            }, 24);
        }
    }
}, 30);

function eventMixin(Draggable) {
    /**
     * 判断元素是否可拖动
     * @param evt Event|TouchEvent
     * @private
     */
    Draggable.prototype._onTapStart = function (evt) {
        var darEl = this.darEl;
        var options = this.options;
        var preventOnFilter = options.preventOnFilter;
        var type = evt.type;
        var touch = evt.touches && evt.touches[0];
        var target = (touch || evt).target;
        var originalTarget = evt.target.shadowRoot && evt.path && evt.path[0] || target;
        var filter = options.filter;

        // 禁止同时触发两个拖拽事件
        if (this.dragEl) {
            return;
        }

        // 鼠标事件必须同时按下鼠标左键;用户手动设置禁止拖拽
        if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
            return;
        }

        // 判断是否为可拖拽元素
        target = closest(target, options.draggable, darEl);
        if (!target) {
            return;
        }
        // 获取元素起始位置
        this.oldIndex = index(target, options.draggable);

        // 过滤元素
        if (filter) {
            var _this = this;
            var fromEl = hasClass(target, options.darClass) ? darEl : closest(target, '.' + options.darClass, darEl);
            filter = filter.split(',').some(function (criteria) {
                criteria = closest(originalTarget, criteria.trim(), darEl);
                if (criteria) {
                    _dispatchEvent(_this, criteria, 'filter', target, fromEl, null, null, null);
                    return true;
                }
            });

            if (filter) {
                preventOnFilter && evt.preventDefault();
                return;
            }
        }

        // 判断是否设置了handle
        if (options.handle && !closest(originalTarget, options.handle, darEl)) {
            return;
        }

        this._prepareDragStart(evt, touch, target);
    };

    /**
     * 拖拽元素前的准备工作
     * @param evt
     * @param touch
     * @param target
     * @param startIndex
     * @private
     */
    Draggable.prototype._prepareDragStart = function (evt, touch, target) {
        var _this = this;
        var darEl = _this.darEl;
        var options = _this.options;
        var dragStartFn = void 0;

        // 不强制要求draggable为darEl的直接子元素
        if (target && !_this.dragEl) {
            _this.tapEvt = evt;

            _this.dragEl = target;
            // 这时需要为fromEl复制，确定来源
            _this.fromEl = hasClass(_this.dragEl, options.darClass) ? darEl : closest(_this.dragEl, '.' + options.darClass, darEl);

            dragStartFn = function dragStartFn() {
                toggleClass(_this.dragEl, options.chosenClass, true);
                _this.dragEl.draggable = _this.nativeDraggable;
                _this._triggerDragStart(evt, touch);
                _dispatchEvent(_this, darEl, 'choose', _this.dragEl, _this.fromEl, null, null, null);
            };

            options.ignore.split(',').forEach(function (criteria) {
                find(_this.dragEl, criteria.trim(), _disableDraggable);
            });
            on(document, 'selectstart', _this);
            dragStartFn();
        }
    };

    /**
     *
     * @param evt
     * @param touch
     * @private
     */
    Draggable.prototype._triggerDragStart = function (evt, touch) {
        // pointerType: mouse, pen, touch
        touch = touch || (evt.pointerType === 'touch' ? evt : null);
        if (touch) {
            // 手势
            this.tapEvt = {
                target: this.dragEl,
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            this._onDragStart(this.tapEvt, 'touch');
        } else if (!this.nativeDraggable) {
            // 鼠标事件
            this._onDragStart(this.tapEvt, true);
        } else {
            // H5拖拽
            on(this.darEl, 'dragstart', this._onDragStart);
        }
        // 处理selection
        try {
            if (document.selection) {
                // IE
                setTimeout(function () {
                    document.selection.empty();
                }, 0);
            } else {
                window.getSelection().removeAllRanges();
            }
        } catch (err) {}
    };

    /**
     * 拖拽开始
     * @param evt
     * @param useFallback
     * @private
     */
    Draggable.prototype._onDragStart = function (evt, useFallback) {
        if (useFallback) {
            if (useFallback === 'touch') {
                // 手势事件
                on(document, 'touchmove', this._onMove);
                on(document, 'touchend', this._onDrop);
                on(document, 'touchcancel', this._onDrop);
                on(document, 'pointermove', this._onMove);
                on(document, 'pointerup', this._onDrop);
            } else {
                // 鼠标事件
                on(document, 'mousemove', this._onMove);
                on(document, 'mouseup', this._onDrop);
            }
        } else {
            on(this.dorEl, 'dragover', this);
            on(document, 'drop', this);
        }
        setTimeout(this._dragStarted, 0);
    };

    Draggable.prototype._dragStarted = function () {
        if (this.dragEl && this.darEl) {
            var options = this.options;

            toggleClass(this.dragEl, options.chosenClass, true);

            _dispatchEvent(this, this.darEl, 'start', this.dragEl, this.fromEl, null, null, null);
        } else {
            this._nulling();
        }
    };

    /**
     * 处理非H5拖拽是ghost元素
     * 对应mousemove,pointermove,drag事件
     * @param evt
     * @private
     */
    Draggable.prototype._onMove = function (evt) {
        if (this.tapEvt && this.moved) {
            evt = evt.touches ? evt.touches[0] : evt;
            this._appendGhost();
            this._onDrag(evt);
            // 进入容器显示占位符
            var rect = this.ghostEl.getBoundingClientRect();
            css(this.ghostEl, 'left', evt.clientX - rect.width / 2 - document.body.scrollLeft + 'px');
            css(this.ghostEl, 'top', evt.clientY - rect.height / 2 - document.body.scrollTop + 'px');
        }
        this.moved = true;
    };

    /**
     *
     * @param evt
     * @private
     */
    Draggable.prototype._onDrag = function (evt) {
        this.entered = _isEntered(evt.clientX, evt.clientY, this.dorEl);
        this.entered && this._appendPlaceholder(evt);
        // 非H5拖拽且进入容器
        !this.nativeDraggable && this.entered && _autoScroll(evt, this);
    };

    Draggable.prototype._onDrop = function (evt) {
        console.log('onDrop');
        // 解绑事件
        if (evt.touches || evt.type === 'pointerup') {
            off(document, 'touchmove', this._onMove);
            off(document, 'touchend', this._onDrop);
            off(document, 'touchcancel', this._onDrop);
            off(document, 'pointermove', this._onMove);
            off(document, 'pointerup', this._onDrop);
        } else if (!this.nativeDraggable) {
            off(document, 'mousemove', this._onMove);
            off(document, 'mouseup', this._onDrop);
        } else {
            off(this.darEl, 'dragstart', this._onDragStart);
            off(this.dorEl, 'dragover', this);
            off(this.dragEl, 'dragend', this);
            off(document, 'drop', this);
        }
        // 清除自动滚动的定时器
        clearInterval(this.pid);
        var options = this.options;
        if (this.entered) {
            this.toEl = closest(this.phEl, '.' + options.dorClass, this.dorEl);
            // 获取newIndex
            this.newIndex = index(this.phEl, '.' + options.relClass);
            if (this.oldIndex > -1 && this.newIndex > -1) {
                _dispatchEvent(this, this.darEl, 'end', this.dragEl, this.fromEl, this.toEl, this.oldIndex, this.newIndex);
            }
        }
        this._nulling();
    };

    /**
     * 生成ghost元素
     * @private
     */
    Draggable.prototype._appendGhost = function () {
        if (!this.ghostEl) {
            var options = this.options;
            var ghostEl = document.createElement('div');
            ghostEl.appendChild(this.dragEl.cloneNode(true));

            toggleClass(ghostEl, options.ghostClass, true);

            css(ghostEl, 'zIndex', '100000');

            document.body.appendChild(ghostEl);
            this.ghostEl = ghostEl;
        }
    };

    /**
     * 生成占位符
     * @param evt
     * @private
     */
    Draggable.prototype._appendPlaceholder = function (evt) {
        var options = this.options;
        if (!this.phEl) {
            // 生成占位符元素
            var placeholderEl = document.createElement('div');
            toggleClass(placeholderEl, options.phClass, true);
            this.phEl = placeholderEl;
        }
        var relEl = _getRelEl(evt.clientX, evt.clientY, this.dorEl, options.dorClass, options.relClass);
        //获取的相对元素为占位符
        if (relEl === this.phEl) {
            console.log('draggable-phEl:relEl equals phEl');
            return;
        }
        var position = _getPosition(evt.clientX, evt.clientY, relEl);
        // 需要根据relEl和position判断是否需要处理phEl
        var insertType = options.direction === 'row' && (position === 'rt' || position === 'rb') || options.direction === 'column' && (position === 'lb' || position === 'rb') ? 'after' : 'before';
        // 相对元素和显示位置不变
        if (relEl === this.relEl && insertType === this.insertType) {
            return;
        }
        this.relEl = relEl;
        this.insertType = insertType;
        if (hasClass(relEl, options.dorClass) || relEl === this.dorEl) {
            this.phEl.parentNode !== relEl && relEl.appendChild(this.phEl);
            return;
        }
        var container = closest(relEl, '.' + options.dorClass, this.dorEl) || this.dorEl;
        if (insertType === 'before') {
            container.insertBefore(this.phEl, relEl);
        } else {
            var nextEl = relEl.nextElementSibling;
            nextEl ? container.insertBefore(this.phEl, nextEl) : container.appendChild(this.phEl);
        }
    };

    /**
     * 拖拽事件分发
     * @param evt
     */
    Draggable.prototype.handleEvent = function (evt) {
        switch (evt.type) {
            case 'drop':
            case 'dragend':
                this._onDrop(evt);
                break;
            case 'dragover':
                this._onDrag(evt);
                _globalDragOver(evt);
                break;
            case 'selectstart':
                evt.preventDefault();
                break;
        }
    };
}

function initEvents(inst) {
    var darEl = inst.darEl;
    // 绑定初始点击事件
    on(darEl, 'mousedown', inst._onTapStart);
    on(darEl, 'touchstart', inst._onTapStart);
    on(darEl, 'pointerdown', inst._onTapStart);
}

/**
 * 初始化相关对象
 * Created by ann_wei_li@kingdee.com on 2017/10/9.
 */

function initMixin(Draggable) {
        /**
         * 初始化函数
         * @param darEl 可拖拽元素容器
         * @param dorEl 可拖放元素容器
         * @param options 配置项
         * @private
         */
        Draggable.prototype._init = function (darEl, dorEl, options) {
                options = extend({}, options);
                var defaults = {
                        disabled: false,
                        handle: null,
                        draggable: /[uo]l/i.test(darEl.nodeName) ? 'li' : '>*', // 可被拖拽的元素
                        filter: null, // 过滤的元素
                        preventOnFilter: true,
                        ignore: 'a, img', // 忽略的标签
                        ghostClass: 'draggable-ghost',
                        chosenClass: 'draggable-chosen',
                        darClass: 'draggable-dar',
                        dorClass: 'draggable-dor',
                        relClass: 'draggable-rel',
                        phClass: 'draggable-ph',
                        dataIdAttr: 'data-id',
                        direction: 'column',
                        forceFallback: false, // 强制不使用H5拖拽
                        scrollSensitivity: 30,
                        scroll: true,
                        scrollSpeed: 10
                };

                for (var name in defaults) {
                        !(name in options) && (options[name] = defaults[name]);
                }

                // 绑定this
                for (var fn in this) {
                        if (fn.charAt(0) === '_' && typeof this[fn] === 'function') {
                                this[fn] = this[fn].bind(this);
                        }
                }

                this.options = options;

                this.darEl = darEl; // 可拖拽元素的容器元素
                this.dorEl = dorEl; // 可放置元素的容器元素
                this.dragEl = null; // 当前拖拽元素
                this.cloneEl = null; // 当前拖拽元素的副本
                this.ghostEl = null; // 随鼠标移动的拖拽副本
                this.phEl = null; // 占位符元素
                this.relEl = null; // 占位符显示位置的相对元素

                this.fromEl = null;
                this.toEl = null;

                this.oldIndex = null; // 拖拽开始位置
                this.newIndex = null; // 放置时的位置

                this.tapEvt = null;

                this.moved = false; // 标识是否移动
                this.entered = false; // 标识是否进入容器

                this.insertType = null;
                // 标识是否支持H5拖拽
                this.nativeDraggable = options.forceFallback ? false : !!('draggable' in document.createElement('div'));

                this.pid = null; // 自动滚动的定时器id

                initEvents(this);
        };

        Draggable.prototype._nulling = function () {
                window.clearInterval(this.pid);
                // 删除占位符
                this.phEl && this.phEl.parentNode && this.phEl.parentNode.removeChild(this.phEl);
                // 删除ghost元素
                this.ghostEl && this.ghostEl.parentNode && this.ghostEl.parentNode.removeChild(this.ghostEl);
                Object.assign(this, {
                        ghostEl: null,
                        cloneEl: null,
                        dragEl: null,
                        relEl: null,
                        phEl: null,
                        fromEl: null,
                        toEl: null,
                        oldIndex: -1,
                        newIndex: -1,
                        tapEvt: null,
                        moved: false,
                        pid: null
                });
        };
}

/**
 * Created by ann_wei_li@kingdee.com on 2017/9/18.
 */

/**
 *
 * @param darEl
 * @param dorEl
 * @param options
 * @constructor
 */
function Draggable(darEl, dorEl) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!(this instanceof Draggable)) {
        throw new Error('Draggable is a constructor and should be called with the `new` keyword');
    }
    // 判断el
    if (!(darEl && darEl.nodeType && darEl.nodeType === 1)) {
        throw 'Draggable: `darEl` must be HTMLElement, and not ' + {}.toString.call(darEl);
    }
    if (!(dorEl && dorEl.nodeType && dorEl.nodeType === 1)) {
        throw 'Draggable: `dorEl` must be HTMLElement, and not ' + {}.toString.call(dorEl);
    }

    this._init(darEl, dorEl, options);
}

initMixin(Draggable);
eventMixin(Draggable);

return Draggable;

}());
//# sourceMappingURL=Draggable.iife.js.map
