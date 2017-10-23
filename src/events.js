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
import { throttle, closest, index, on, off, find, toggleClass, css, hasClass} from './utils'

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
    let evt = document.createEvent('Event')
    let options = draggable.options
    let onName = 'on' + name.charAt(0).toUpperCase() + name.substr(1)

    evt.initEvent(name, true, true)
    evt.item = targetEl || fromEl
    evt.clone = draggable.cloneEl
    evt.from = fromEl
    evt.to = toEl
    evt.oldIndex = oldIndex
    evt.newIndex = newIndex

    rootEl.dispatchEvent(evt)

    if (options[onName]) {
        options[onName].call(draggable, evt)
    }
}

/**
 * 将对应元素设置成不可拖拽
 * @param el
 * @private
 */
function _disableDraggable(el) {
    el.draggable = false
}

function _globalDragOver(evt) {
    if (evt.dataTransfer) {
        evt.dataTransfer.dropEffect = 'move'
    }
    evt.preventDefault()
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
function _getRelEl (x, y, dorEl, dorClass, relClass) {
    // document.elementFromPoint(x, y)
    let child = dorEl.firstElementChild
    while (child) {
        let rect = child.getBoundingClientRect()
        if (rect.top <= y && y <= (rect.top + rect.height)) {
            if (hasClass(child, dorClass)) { // 存在子容器
                //
                let subDorEls = child.getElementsByClassName(dorClass)
                child = subDorEls.length > 0 ? subDorEls[0] : child
                break
            }
            return child
        }
        child = child.nextElementSibling
    }
    // 不存在相对元素，返回容器元素
    if (!child) return dorEl
    return _getRelEl(x, y, child, dorClass, relClass)
}

/**
 * 获取当前坐标在相对元素上的方位
 * @param x
 * @param y
 * @param relEl
 * @returns {string} lt,lb,rt,rb
 * @private
 */
function _getPosition (x, y, relEl) {
    let rect = relEl.getBoundingClientRect()
    let position = ''
    if (x < (rect.left + rect.width / 2)) {
        position = y < (rect.top + rect.height / 2) ? 'lt' : 'lb'
    } else {
        position = y < (rect.top + rect.height / 2) ? 'rt' : 'rb'
    }
    return position
}

/**
 * 判断是否进入容器
 * @param x
 * @param y
 * @param container
 * @returns {boolean}
 * @private
 */
function _isEntered (x, y, container) {
    if (container) {
        let rect = container.getBoundingClientRect()
        return rect.left < x && x < (rect.left + rect.width) &&
            rect.top < y && y < (rect.top + rect.height)
    }
    return false
}

/**
 * 容器自动滚动
 * @param container
 * @param options
 * @param evt
 * @private
 */
let _autoScroll = throttle(function (evt, inst) {
    if (inst && inst.dorEl && inst.options.scroll) {
        let options = inst.options
        let x = evt.clientX
        let y = evt.clientY
        let scrollOffsetX
        let scrollOffsetY
        let sens = options.scrollSensitivity
        let scrollCustomFn = options.scrollFn
        let speed = options.scrollSpeed
        let rect = inst.dorEl.getBoundingClientRect()
        let vx
        let vy
        if (inst.dorEl === window) {
            vx = ( window.innerWidth - x <= sens) - (x <= sens)
            vy = (window.innerHeight - y <= sens) - (y <= sens)
        } else {
            vx = (Math.abs(rect.right - x) <= sens) - (Math.abs(rect.left - x) <= sens)
            vy = (Math.abs(rect.bottom - y) <= sens) - (Math.abs(rect.top - y) <= sens)
        }


        if (inst.vx !== vx || inst.vy !== vy) {
            inst.vx = vx
            inst.vy = vy

            clearInterval(inst.pid)

            inst.pid = setInterval(function () {
                scrollOffsetY = vy ? vy * speed : 0
                scrollOffsetX = vx ? vx * speed : 0

                if ('function' === typeof(scrollCustomFn)) {
                    return scrollCustomFn.call(inst, scrollOffsetX, scrollOffsetY, evt)
                }

                if (inst.dorEl === window) {
                    window.scrollTo(window.pageXOffset + scrollOffsetX, window.pageYOffset + scrollOffsetY)
                } else {
                    inst.dorEl.scrollTop += scrollOffsetY
                    inst.dorEl.scrollLeft += scrollOffsetX
                }
            }, 24)
        }
    }
}, 30)

export function eventMixin (Draggable) {
    /**
     * 判断元素是否可拖动
     * @param evt Event|TouchEvent
     * @private
     */
    Draggable.prototype._onTapStart = function (evt) {
        const darEl = this.darEl
        let options = this.options
        let preventOnFilter = options.preventOnFilter
        let type = evt.type
        let touch = evt.touches && evt.touches[0]
        let target = (touch || evt).target
        let originalTarget = evt.target.shadowRoot && (evt.path && evt.path[0]) || target
        let filter = options.filter

        // 禁止同时触发两个拖拽事件
        if (this.dragEl) {
            return
        }

        // 鼠标事件必须同时按下鼠标左键;用户手动设置禁止拖拽
        if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
            return
        }

        // 判断是否为可拖拽元素
        target = closest(target, options.draggable, darEl)
        if (!target) {
            return
        }
        // 获取元素起始位置
        this.oldIndex = index(target, options.draggable)

        // 过滤元素
        if (filter) {
            const _this = this
            let fromEl = hasClass(target, options.darClass) ? darEl : closest(target, `.${options.darClass}`, darEl)
            filter = filter.split(',').some(function (criteria) {
                criteria = closest(originalTarget, criteria.trim(), darEl)
                if (criteria) {
                    _dispatchEvent(_this, criteria, 'filter', target, fromEl, null, null, null)
                    return true
                }
            })

            if (filter) {
                preventOnFilter && evt.preventDefault()
                return
            }
        }

        // 判断是否设置了handle
        if (options.handle && !closest(originalTarget, options.handle, darEl)) {
            return
        }

        this._prepareDragStart(evt, touch, target)
    }

    /**
     * 拖拽元素前的准备工作
     * @param evt
     * @param touch
     * @param target
     * @param startIndex
     * @private
     */
    Draggable.prototype._prepareDragStart = function (evt, touch, target) {
        const _this = this
        let darEl = _this.darEl
        let options = _this.options
        let dragStartFn

        // 不强制要求draggable为darEl的直接子元素
        if (target && !_this.dragEl) {
            _this.tapEvt = evt

            _this.dragEl = target
            // 这时需要为fromEl复制，确定来源
            _this.fromEl = hasClass(_this.dragEl, options.darClass) ? darEl : closest(_this.dragEl, `.${options.darClass}`, darEl)

            dragStartFn = function () {
                toggleClass(_this.dragEl, options.chosenClass, true)
                _this.dragEl.draggable = _this.nativeDraggable
                _this._triggerDragStart(evt, touch)
                _dispatchEvent(_this, darEl, 'choose', _this.dragEl, _this.fromEl, null, null, null)
            }

            options.ignore.split(',').forEach(function (criteria) {
                find(_this.dragEl, criteria.trim(), _disableDraggable)
            })
            on(document, 'selectstart', _this)
            dragStartFn()
        }
    }

    /**
     *
     * @param evt
     * @param touch
     * @private
     */
    Draggable.prototype._triggerDragStart = function (evt, touch) {
        // pointerType: mouse, pen, touch
        touch = touch || (evt.pointerType === 'touch' ? evt : null)
        if (touch) { // 手势
            this.tapEvt = {
                target: this.dragEl,
                clientX: touch.clientX,
                clientY: touch.clientY
            }
            this._onDragStart(this.tapEvt, 'touch')
        } else if (!this.nativeDraggable) { // 鼠标事件
            this._onDragStart(this.tapEvt, true)
        } else { // H5拖拽
            on(this.darEl, 'dragstart', this._onDragStart)
        }
        // 处理selection
        try {
            if (document.selection) { // IE
                setTimeout(function () {
                    document.selection.empty()
                }, 0)
            } else {
                window.getSelection().removeAllRanges()
            }
        } catch (err) {
        }
    }

    /**
     * 拖拽开始
     * @param evt
     * @param useFallback
     * @private
     */
    Draggable.prototype._onDragStart = function (evt, useFallback) {
        if (useFallback) {
            if (useFallback === 'touch') { // 手势事件
                on(document, 'touchmove', this._onMove)
                on(document, 'touchend', this._onDrop)
                on(document, 'touchcancel', this._onDrop)
                on(document, 'pointermove', this._onMove)
                on(document, 'pointerup', this._onDrop)
            } else { // 鼠标事件
                on(document, 'mousemove', this._onMove)
                on(document, 'mouseup', this._onDrop)
            }
        } else {
            on(this.dorEl, 'dragover', this)
            on(document, 'drop', this)
        }
        setTimeout(this._dragStarted, 0)
    }

    Draggable.prototype._dragStarted = function () {
        if (this.dragEl && this.darEl) {
            let options = this.options

            toggleClass(this.dragEl, options.chosenClass, true)

            _dispatchEvent(this, this.darEl, 'start', this.dragEl, this.fromEl, null, null, null)
        } else {
            this._nulling()
        }
    }

    /**
     * 处理非H5拖拽是ghost元素
     * 对应mousemove,pointermove,drag事件
     * @param evt
     * @private
     */
    Draggable.prototype._onMove = function (evt) {
        if (this.tapEvt && this.moved) {
            evt = evt.touches ? evt.touches[0] : evt
            this._appendGhost()
            this._onDrag(evt)
            // 进入容器显示占位符
            let rect = this.ghostEl.getBoundingClientRect()
            css(this.ghostEl, 'left', `${evt.clientX - rect.width / 2 - document.body.scrollLeft}px`)
            css(this.ghostEl, 'top', `${evt.clientY - rect.height / 2 - document.body.scrollTop}px`)
        }
        this.moved = true
    }

    /**
     *
     * @param evt
     * @private
     */
    Draggable.prototype._onDrag = function (evt) {
        this.entered = _isEntered(evt.clientX, evt.clientY, this.dorEl)
        this.entered && this._appendPlaceholder(evt)
        // 非H5拖拽且进入容器
        !this.nativeDraggable && this.entered && _autoScroll(evt, this)
    }

    Draggable.prototype._onDrop = function (evt) {
        console.log('onDrop')
        // 解绑事件
        if (evt.touches || evt.type === 'pointerup') {
            off(document, 'touchmove', this._onMove)
            off(document, 'touchend', this._onDrop)
            off(document, 'touchcancel', this._onDrop)
            off(document, 'pointermove', this._onMove)
            off(document, 'pointerup', this._onDrop)
        } else if (!this.nativeDraggable) {
            off(document, 'mousemove', this._onMove)
            off(document, 'mouseup', this._onDrop)
        } else {
            off(this.darEl, 'dragstart', this._onDragStart)
            off(this.dorEl, 'dragover', this)
            off(this.dragEl, 'dragend', this)
            off(document, 'drop', this)
        }
        // 清除自动滚动的定时器
        clearInterval(this.pid)
        let options = this.options
        if (this.entered) {
            this.toEl = closest(this.phEl, `.${options.dorClass}`, this.dorEl)
            // 获取newIndex
            this.newIndex = index(this.phEl, `.${options.relClass}`)
            if (this.oldIndex > -1 && this.newIndex > -1) {
                _dispatchEvent(this, this.darEl, 'end', this.dragEl, this.fromEl, this.toEl, this.oldIndex, this.newIndex)
            }
        }
        this._nulling()
    }

    /**
     * 生成ghost元素
     * @private
     */
    Draggable.prototype._appendGhost = function () {
        if (!this.ghostEl) {
            let options = this.options
            let ghostEl = document.createElement('div')
            ghostEl.appendChild(this.dragEl.cloneNode(true))

            toggleClass(ghostEl, options.ghostClass, true)

            css(ghostEl, 'zIndex', '100000')

            document.body.appendChild(ghostEl)
            this.ghostEl = ghostEl
        }
    }

    /**
     * 生成占位符
     * @param evt
     * @private
     */
    Draggable.prototype._appendPlaceholder = function (evt) {
        let options = this.options
        if (!this.phEl) {
            // 生成占位符元素
            let placeholderEl = document.createElement('div')
            toggleClass(placeholderEl, options.phClass, true)
            this.phEl = placeholderEl
        }
        let relEl = _getRelEl(evt.clientX, evt.clientY, this.dorEl, options.dorClass, options.relClass)
        //获取的相对元素为占位符
        if (relEl === this.phEl) {
            console.log('draggable-phEl:relEl equals phEl')
            return
        }
        let position = _getPosition(evt.clientX, evt.clientY, relEl)
        // 需要根据relEl和position判断是否需要处理phEl
        let insertType = (options.direction === 'row' && (position === 'rt' || position === 'rb')) ||
            (options.direction === 'column' && (position === 'lb' || position === 'rb')) ? 'after' : 'before'
        // 相对元素和显示位置不变
        if (relEl === this.relEl && insertType === this.insertType) {
            return
        }
        this.relEl = relEl
        this.insertType = insertType
        if (hasClass(relEl, options.dorClass) || relEl === this.dorEl) {
            this.phEl.parentNode !== relEl && relEl.appendChild(this.phEl)
            return
        }
        let container = closest(relEl, `.${options.dorClass}`, this.dorEl) || this.dorEl
        if (insertType === 'before') {
            container.insertBefore(this.phEl, relEl)
        } else {
            let nextEl = relEl.nextElementSibling
            nextEl ? container.insertBefore(this.phEl, nextEl) : container.appendChild(this.phEl)
        }
    }

    /**
     * 拖拽事件分发
     * @param evt
     */
    Draggable.prototype.handleEvent = function (evt) {
        switch (evt.type) {
            case 'drop':
            case 'dragend':
                this._onDrop(evt)
                break
            case 'dragover':
                this._onDrag(evt)
                _globalDragOver(evt)
                break
            case 'selectstart':
                evt.preventDefault()
                break
        }
    }
}


export function initEvents (inst) {
    const darEl = inst.darEl
    // 绑定初始点击事件
    on(darEl, 'mousedown', inst._onTapStart)
    on(darEl, 'touchstart', inst._onTapStart)
    on(darEl, 'pointerdown', inst._onTapStart)
}
