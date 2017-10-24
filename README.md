# Draggable
A drag library.

Demo: http://njed.github.io/Draggable

## Feature

### Usage
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
     scrollSpeed: 10,
     onChoose: function(evt) {
         
     },
     onStart: function(evt) {
       
     },
     onMove: function(evt) {
       
     },
     onEnd: function(evt) {
       
     }
 })
```