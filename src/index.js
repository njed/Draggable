/**
 * Created by ann_wei_li@kingdee.com on 2017/9/18.
 */

import { initMixin } from './init'
import { eventMixin } from './events'

/**
 *
 * @param darEl
 * @param dorEl
 * @param options
 * @constructor
 */
function Draggable (darEl, dorEl, options = {}) {
    if (!(this instanceof Draggable)) {
        throw new Error('Draggable is a constructor and should be called with the `new` keyword')
    }
    // 判断el
    if (!(darEl && darEl.nodeType && darEl.nodeType === 1)) {
        throw 'Draggable: `darEl` must be HTMLElement, and not ' + {}.toString.call(darEl);
    }
    if (!(dorEl && dorEl.nodeType && dorEl.nodeType === 1)) {
        throw 'Draggable: `dorEl` must be HTMLElement, and not ' + {}.toString.call(dorEl);
    }

    this._init(darEl, dorEl, options)
}

initMixin(Draggable)
eventMixin(Draggable)

export default Draggable
