(function() {
  /**
  * This module provides a drawing tool.
  * @module thr0w-draw
  */
  'use strict';
  if (window.thr0w === undefined) {
    throw 400;
  }
  var service = {}; 
  service.load = load;
  /**
  * This object provides draw functionality.
  * @namespace thr0w
  * @class draw
  * @static
  */
  window.thr0w.draw = service;
  /**
  * This function is used to load the draw functionality into a grid.
  * @method load
  * @static
  * @param grid {Object} The grid, {{#crossLink "thr0w.Grid"}}thr0w.Grid{{/crossLink}}, object.
  */
  function load(grid) {
    if (!grid || typeof grid !== 'object') {
      throw 400;
    }
    var open = false;
    var color = null;
    var paint = false;
    var lastX;
    var lastY;
    var frameEl = grid.getFrame();
    var contentEl = grid.getContent();
    var offsetLeft = frameEl.offsetLeft + contentEl.offsetLeft;
    var offsetTop = frameEl.offsetTop + contentEl.offsetTop;
    var palatteEl = document.createElement('div');
    var canvasEl = document.createElement('canvas');
    var context = canvasEl.getContext('2d');
    palatteEl.classList.add('thr0w_draw_palatte'); 
    palatteEl.classList.add('thr0w_draw_palatte--closed'); 
    palatteEl.innerHTML = [ 
      '<div class="thr0w_draw_palatte__color_picker--default thr0w_draw_palatte__color_picker" style="background: black;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__color_picker" style="background: white;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__color_picker" style="background: red;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__color_picker" style="background: orange;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__color_picker" style="background: yellow;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__color_picker" style="background: green;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__color_picker" style="background: blue;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__color_picker" style="background: purple;">\n',
      '</div>\n',
      '<div class="thr0w_draw_palatte__thumb thr0w_draw_palatte__thumb--closed">\n',
      '</div>\n'].join('');
    contentEl.appendChild(palatteEl);
    var thumbEl = palatteEl.querySelector('.thr0w_draw_palatte__thumb');
    var pickerEls = palatteEl.querySelectorAll('.thr0w_draw_palatte__color_picker');
    var i;
    canvasEl.classList.add('thr0w_draw_canvas');
    canvasEl.classList.add('thr0w_draw_canvas--closed');
    canvasEl.width = grid.getWidth();
    canvasEl.height = grid.getHeight();
    canvasEl.addEventListener('mousedown', startPainting);
    canvasEl.addEventListener('mousemove', layPaint);
    canvasEl.addEventListener('mouseup', endPainting);
    canvasEl.addEventListener('mouseleave', endPainting);
    canvasEl.addEventListener('touchstart', startPainting);
    canvasEl.addEventListener('touchmove', layPaint);
    canvasEl.addEventListener('touchend', endPainting);
    canvasEl.addEventListener('touchcancel', endPainting);
    contentEl.appendChild(canvasEl);
    thumbEl.addEventListener('click', toggleOpen);
    for (i = 0; i < pickerEls.length; i++) {
      pickerEls[i].addEventListener('click', pickColor); 
    }
    reset();
    var sync = new window.thr0w.Sync(
      grid,
      'thr0w_draw_' + contentEl.id,
      message,
      receive
      );
    function startPainting(e) {
      if (e.type === 'mousedown') {
        lastX = e.pageX - offsetLeft;
        lastY = e.pageY - offsetTop;
      } else {
        lastX = Math.floor(e.changedTouches[0].pageX) - offsetLeft;
        lastY = Math.floor(e.changedTouches[0].pageY) - offsetTop;
      }
      paint = true;
      context.beginPath();
    }
    function layPaint(e) {
      var x;
      var y;
      if (paint) {
        if (e.type === 'mousemove') {
          x = e.pageX - offsetLeft;
          y = e.pageY - offsetTop;
        } else {
          x = Math.floor(e.changedTouches[0].pageX) - offsetLeft;
          y = Math.floor(e.changedTouches[0].pageY) - offsetTop;
        }

        context.moveTo(lastX, lastY);
        context.lineTo(x, y);
        context.stroke();
        lastX = x;
        lastY = y;
      }
    }
    function endPainting(e) {
      e.preventDefault(); // USED TO PREVENT INTERPRET AS CLICK
      if (paint) {
        paint = false;
        context.closePath();
      }
    }
    function toggleOpen() {
      open = !open;
      sendUpdate();
      updateCanvasPalatte();
    } 
    function updateCanvasPalatte() {
      if (open) {
        canvasEl.classList.remove('thr0w_draw_canvas--closed');
        palatteEl.classList.remove('thr0w_draw_palatte--closed');
        thumbEl.classList.remove('thr0w_draw_palatte__thumb--closed'); 
        thumbEl.classList.add('thr0w_draw_palatte__thumb--open');
      } else {
        reset();
        canvasEl.classList.add('thr0w_draw_canvas--closed');
        palatteEl.classList.add('thr0w_draw_palatte--closed');
        thumbEl.classList.remove('thr0w_draw_palatte__thumb--open'); 
        thumbEl.classList.add('thr0w_draw_palatte__thumb--closed');
      }
    }
    function pickColor() {
      color = this.style.backgroundColor; // jshint ignore:line
      for (i = 0; i < pickerEls.length; i++) {
        pickerEls[i].classList.remove('thr0w_draw_palatte__color_picker--selected');
      }
      this.classList.add('thr0w_draw_palatte__color_picker--selected'); // jshint ignore:line
      sendUpdate();
      updateColor();
    }
    function updateColor() {
      context.strokeStyle=color;
    }
    function reset() {
      var defaultPickerEl = palatteEl.querySelector('.thr0w_draw_palatte__color_picker--default');
      color = defaultPickerEl.style.backgroundColor;
      canvasEl.width = canvasEl.width;
      for (i = 0; i < pickerEls.length; i++) {
        pickerEls[i].classList.remove('thr0w_draw_palatte__color_picker--selected');
      }
      defaultPickerEl.classList.add('thr0w_draw_palatte__color_picker--selected');
      context.strokeStyle=color;
    }
    function message() {
      return {open: open, color: color};
    }
    function receive(data) {
      if (data.open !== open) {
        open = !open;
        updateCanvasPalatte();
      }
      color = data.color;
      updateColor();
    }
    function sendUpdate() {
      sync.update();
      sync.idle();
    }
  }
})();
