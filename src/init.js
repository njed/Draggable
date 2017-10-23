/**
 * 初始化相关对象
 * Created by ann_wei_li@kingdee.com on 2017/10/9.
 */

import { extend } from './utils'
import { initEvents } from './events'

export function initMixin (Draggable) {
    /**
     * 初始化函数
     * @param darEl 可拖拽元素容器
     * @param dorEl 可拖放元素容器
     * @param options 配置项
     * @private
     */
    Draggable.prototype._init = function (darEl, dorEl, options) {
        options = extend({}, options)
        const defaults = {
            disabled: false,
            handle: null,
            draggable: /[uo]l/i.test(darEl.nodeName) ? 'li' : '>*', // 可被拖拽的元素
            filter: null, // 过滤的元素
            preventOnFilter: true,
            ignore: 'a, img', // 忽略的标签
            ghostClass: 'draggable-ghost',
            chosenClass: 'draggable-chosen',
            darClass:'draggable-dar',
            dorClass:'draggable-dor',
            relClass: 'draggable-rel',
            phClass: 'draggable-ph',
            dataIdAttr: 'data-id',
            direction: 'column',
            forceFallback: false, // 强制不使用H5拖拽
            scrollSensitivity: 30,
            scroll: true,
            scrollSpeed: 10
        }

        for (let name in defaults) {
            !(name in options) && (options[name] = defaults[name])
        }

        // 绑定this
        for (let fn in this) {
            if(fn.charAt(0) === '_' && typeof this[fn] === 'function') {
                this[fn] = this[fn].bind(this)
            }
        }

        this.options = options

        this.darEl = darEl // 可拖拽元素的容器元素
        this.dorEl = dorEl // 可放置元素的容器元素
        this.dragEl = null // 当前拖拽元素
        this.cloneEl = null // 当前拖拽元素的副本
        this.ghostEl = null // 随鼠标移动的拖拽副本
        this.phEl = null // 占位符元素
        this.relEl = null // 占位符显示位置的相对元素

        this.fromEl = null
        this.toEl = null

        this.oldIndex = null // 拖拽开始位置
        this.newIndex = null  // 放置时的位置

        this.tapEvt = null

        this.moved = false // 标识是否移动
        this.entered = false // 标识是否进入容器

        this.insertType = null
        // 标识是否支持H5拖拽
        this.nativeDraggable = options.forceFallback ? false : (!!('draggable' in document.createElement('div')))

        this.pid = null // 自动滚动的定时器id
        
        initEvents(this)
    }

    Draggable.prototype._nulling = function () {
        window.clearInterval(this.pid)
        // 删除占位符
        this.phEl && this.phEl.parentNode && this.phEl.parentNode.removeChild(this.phEl)
        // 删除ghost元素
        this.ghostEl && this.ghostEl.parentNode && this.ghostEl.parentNode.removeChild(this.ghostEl)
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
        })
    }
}
