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
export function on (el, event, fn, captureMode = false) {
    el.addEventListener(event, fn, captureMode)
}

/**
 * 事件解绑
 * @param el
 * @param event
 * @param fn
 * @param captureMode
 */
export function off (el, event, fn, captureMode = false) {
    el.removeEventListener(event, fn, captureMode)
}

/**
 *
 * @param callback
 * @param ms
 * @returns {Function}
 */
export function throttle(callback, ms) {
    let args
    let _this
    return function () {
        if (args === void 0) {
            args = arguments
            _this = this
            setTimeout(function () {
                if (args.length === 1) {
                    callback.call(_this, args[0])
                } else {
                    callback.apply(_this, args)
                }
                args = void 0
            }, ms)
        }
    }
}

/**
 *
 * @param dst
 * @param src
 * @returns {*}
 */
export function extend (dst, src) {
    if (dst && src) {
        for (var key in src) {
            if (src.hasOwnProperty(key)) {
                dst[key] = src[key]
            }
        }
    }
    return dst
}

export function deepClone (obj) {
    let temp
    let cloneObj = obj.constructor === Array ? [] : {}
    if (typeof  obj !== 'object') {
        return
    } else if (window.JSON) {
        temp = JSON.stringify(obj)
        cloneObj = JSON.parse(temp)
    } else {
        for(let key in obj){
            cloneObj[i] = typeof obj[i] === 'object' ? deepClone(obj[key]) : obj[key]
        }
    }
    return cloneObj
}

/**
 *
 * @param el
 * @param selector
 * @param ctx
 * @returns {*}
 */
export function closest(el, selector, ctx) {
    if (el) {
        ctx = ctx || window.document

        do {
            if ((selector === '>*' && el.parentNode === ctx) || _matches(el, selector)) {
                return el
            }
            /* jshint boss:true */
        } while (el = _getParentOrHost(el))
    }

    return null
}

/**
 *
 * @param el
 * @param selector
 * @returns {number}
 */
export function index (el, selector) {
    let index = 0

    if (!el || !el.parentNode) {
        return -1
    }

    while (el && (el = el.previousElementSibling)) {
        if ((el.nodeName.toUpperCase() !== 'TEMPLATE') && (selector === '>*' || _matches(el, selector))) {
            index++
        }
    }

    return index
}

export function find(ctx, tagName, iterator) {
    if (ctx) {
        let list = ctx.getElementsByTagName(tagName)
        let i = 0
        let n = list.length
        if (iterator) {
            for (; i < n; i++) {
                iterator(list[i], i)
            }
        }
        return list
    }
    return []
}

/**
 *
 * @param el
 * @param name
 * @param state
 */
export function toggleClass (el, name, state) {
    if (el) {
        if (el.classList) {
            el.classList[state ? 'add' : 'remove'](name);
        }
        else {
            var className = (' ' + el.className + ' ').replace(/\s+/g, ' ').replace(' ' + name + ' ', ' ');
            el.className = (className + (state ? ' ' + name : '')).replace(/\s+/g, ' ');
        }
    }
}

export function css (el, prop, val) {
    let style = el && el.style
    if (style) {
        if (val === void 0) {
            if (document.defaultView && document.defaultView.getComputedStyle) {
                val = document.defaultView.getComputedStyle(el, '')
            } else if (el.currentStyle) {
                val = el.currentStyle
            }
            return prop === void 0 ? val : val[prop]
        } else {
            if (!(prop in style)) {
                prop = '-webkit-' + prop
            }
            style[prop] = val + (typeof val === 'string' ? '' : 'px')
        }
    }
}

/**
 * 判断元素是否包含指定的类
 * @param el
 * @param selector
 * @returns {boolean}
 */
export function hasClass(el, selector) {
    let className = el.getAttribute && el.getAttribute('class') || ''
    if (el.nodeType === 1 &&
        (' ' + _stripAndCollapse(className) + ' ').indexOf(' ' + selector + ' ') > -1)  return true
    return false
}

function _stripAndCollapse( value ) {
    let tokens = value.match(( /[^\x20\t\r\n\f]+/g )) || []
    return tokens.join(' ');
}

function _getParentOrHost (el) {
    var parent = el.host

    return (parent && parent.nodeType) ? parent : el.parentNode
}

function _matches (el, selector) {
    if (el) {
        selector = selector.split('.')

        let tag = selector.shift().toUpperCase()
        let re = new RegExp('\\s(' + selector.join('|') + ')(?=\\s)', 'g')

        return (
            (tag === '' || el.nodeName.toUpperCase() == tag) &&
            (!selector.length || ((' ' + el.className + ' ').match(re) || []).length == selector.length)
        )
    }

    return false
}
