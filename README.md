# Draggable
一个简单的拖拽库，参考[Sortable.js](http://github.com/Sortable)

### 用法
```html
<ul class="dar">
    <li class="draggable">item1</li>
    <li class="draggable">item2</li>
</ul>
<ul class="dor">
    <li class="rel"></li>
</ul>
 ```
 ```js
 var darEl = document.querySelector('.dar')
 var dorEl = document.querySelector('.dor')
 var inst = new Draggable(darEl, dorEl, {})
 ```
 ### options
 ```js
 new Draggable(darEl, dorEl, {
     disabled: false,
     handle: null,
     draggable: /[uo]l/i.test(darEl.nodeName) ? 'li' : '>*',
     filter: null,
     preventOnFilter: true,
     ignore: 'a, img',
     ghostClass: 'draggable-ghost',
     chosenClass: 'draggable-chosen',
     darClass:'draggable-dar',
     dorClass:'draggable-dor',
     relClass: 'draggable-rel',
     phClass: 'draggable-ph',
     dataIdAttr: 'data-id',
     direction: 'column',
     forceFallback: false,
     scrollSensitivity: 30,
     scroll: true,
     scrollSpeed: 10,
     // Element is chosen
     onChoose: function(evt) {
     },
     // Element dragging started
     onStart: function(evt) {
     },
     // Element is moving
     onMove: function(evt) {
     },
     // Element dragging ended
     onEnd: function(evt) {
     }
 })
```
#### `darEl`

#### `dorEl`

#### `disabled` option

#### `handle` option

#### `draggable` option

#### `filter` option

#### `preventOnFilter` option

#### `ghostClass` option

#### `chosenClass` option

#### `darClass` option

#### `dorClass` option

#### `relClass` option

#### `phClass` option

#### `dataIdAttr` option

#### `direction` option

#### `forceFallback` option

#### `scrollSensitivity` option

#### `scroll` option

#### `scrollSpeed` option

