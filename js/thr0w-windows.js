(function() {
  /**
  * This module provides a window manager.
  * @module thr0w-windows
  */
  'use strict';
  if (window.thr0w === undefined) {
    throw 400;
  }
  var service = {}; 
  service.WindowManager = WindowManager;
  /**
  * This object provides the window management functionality.
  * @namespace thr0w
  * @class windows
  * @static
  */
  window.thr0w.windows = service;
  /**
  * This class is used to create window managers.
  * @namespace thr0w.windows
  * @class WindowManager
  * @constructor
  * @param grid {Object} The grid, {{#crossLink "thr0w.Grid"}}Thr0w.Grid{{/crossLink}}, object.
  */
  function WindowManager(grid) {
    if (!grid || typeof grid !== 'object') {
      throw 400;
    }
    var windows = [];
    var contentEl = grid.getContent();
    var sync = new window.thr0w.Sync(
      grid,
      'thr0w_windows_' + contentEl.id,
      message,
      receive
      );
    this.Window = Window;
    function message() {
      var data = [];
      var i;
      for (i = 0; i < windows.length; i++) {
        var iWindow = windows[i];
        data.push({
          id: iWindow.getId(),
          x: iWindow.getX(),
          y: iWindow.getY(),
          width: iWindow.getWidth(),
          height: iWindow.getHeight(),
          src: iWindow.getSrc() 
        });
      }
      return data;
    }
    function receive(data) {
      var windowIds = windows.map(getWindowId);
      var i;
      for (i = 0; i < data.length; i++) {
        if (windowIds.indexOf(data[i].id) === -1) {
          new Window(data[i].id, data[i].x, data[i].y, data[i].width, data[i].height, data[i].src);
        }
      }
    }
    /**
    * This class is used to create windows.
    * @namespace thr0w.windows.WindowManager
    * @class Window
    * @constructor
    * @param id {String} The id.
    * @param x {Integer} The horizontal position.
    * @param y {Integer} The vertical position.
    * @param width {Integer} The width.
    * @param height {Integer} The height.
    * @param src {String} The source url.
    */
    function Window(id, x, y, width, height, src) {
      // TODO:  MiN MAX WIDTH HEIGHT
      var BAR_HEIGHT = 50;
      var BASE = 799;
      var windowIds = windows.map(getWindowId);
      if (id === undefined || typeof id !== 'string'|| windowIds.indexOf(id) !== -1) {
       throw 400;
      } 
      if (x === undefined || typeof x !== 'number') {
        throw 400;
      }
      if (y === undefined || typeof y !== 'number') {
        throw 400;
      }
      if (width === undefined || typeof width !== 'number') {
        throw 400;
      }
      if (height === undefined || typeof height !== 'number') {
        throw 400;
      }
      if (src === undefined || typeof src !== 'string') {
        throw 400;
      }
      if (x + width > grid.getWidth()) {
        throw 400;
      }
      if (y + height + BAR_HEIGHT > grid.getHeight()) {
        throw 400;
      } 
      var z = BASE;
      var active = false;
      var lastX;
      var lastY;
      var moving = false;
      var scrollX = 0;
      var scrollY = 0;
      var startScrolling = false;
      var endScrolling = true;
      var windowEl = document.createElement('div');
      var windowBarEl;
      var windowControlsEl;
      var windowContentEl;
      var windowCoverEl;
      var windowSync = new window.thr0w.Sync(
        grid,
        'thr0w_windows_' + contentEl.id + '_' + id,
        windowMessage,
        windowReceive
        );
      windowEl.style.left = x + 'px';
      windowEl.style.top = y + 'px';
      windowEl.style.width = + width + 'px';
      windowEl.style.height = (height + BAR_HEIGHT) + 'px';
      windowEl.classList.add('thr0w_windows_window');
      windowEl.innerHTML = [
        '<div class="thr0w_windows_window__bar">',
        '<div class="thr0w_windows_window__bar__controls">',
'<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewbox="0 0 100 100" class="thr0w_windows_window__bar__controls__control">',
'<g>',
'<ellipse fill="#ffffff" stroke-width="2" cx="50" cy="50" id="svg_1" rx="49" ry="49" stroke="#cccccc"/>',
'<rect fill="#cccccc" stroke-width="2" stroke-dasharray="null" stroke-linejoin="null" stroke-linecap="null" x="1" y="75" width="99" height="24" id="svg_3" fill-opacity="0.5" stroke="#cccccc"/>',
'</g>',
'</svg>',
'<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewbox="0 0 100 100" class="thr0w_windows_window__bar__controls__control">',
'<g>',
'<ellipse fill="#ffffff" stroke-width="2" cx="50" cy="50" id="svg_1" rx="49" ry="49" stroke="#cccccc"/>',
'<rect fill="#cccccc" stroke-width="2" stroke-dasharray="null" stroke-linejoin="null" stroke-linecap="null" x="1" y="1" width="99" height="24" id="svg_3" fill-opacity="0.5" stroke="#cccccc"/>',
'</g>',
'</svg>',
'<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewbox="0 0 100 100" class="thr0w_windows_window__bar__controls__control">',
'<g>',
'<ellipse stroke="#cccccc" ry="49" rx="49" id="svg_1" cy="50" cx="50" stroke-width="2" fill="#ffffff"/>',
'<path id="svg_4" fill-opacity="0.5" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="2" stroke="#cccccc" fill="#cccccc"/>',
'<path id="svg_6" d="m13.75,30.5l18.5,18.75l-19.5,20.25l17.25,16.75l20.5,-19l19.25,19.5l17.25,-17l-19.5,-19.25l19.75,-19.75l-17.5,-17.5l-19.25,20l-19.5,-20l-17.25,17.25z" fill-opacity="0.5" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="2" stroke="#cccccc" fill="#cccccc"/>',
'</g>',
'</svg>',
        '</div>',
        '</div>',
        '<iframe src="' + src + '" width="' + width + '" height="' + height + '" frameborder="0" class="thr0w_windows_window__content">',
        '</iframe>',
        '<div style="width: '  + width + 'px; height: ' + height +'px;" class="thr0w_windows_window__cover"></div>',
      ].join('\n');
      windowEl.addEventListener('mousedown', activate);
      windowBarEl = windowEl.querySelector('.thr0w_windows_window__bar');
      windowBarEl.addEventListener('mousedown', startMoving);
      windowBarEl.addEventListener('mousemove', move);
      windowBarEl.addEventListener('mouseup', endMoving);
      windowBarEl.addEventListener('mouseleave', endMoving);
      windowControlsEl = windowEl.querySelector('.thr0w_windows_window__bar__controls');
      windowContentEl = windowEl.querySelector('.thr0w_windows_window__content');
      windowContentEl.addEventListener('load', contentLoaded);
      windowCoverEl = windowEl.querySelector('.thr0w_windows_window__cover');
      contentEl.appendChild(windowEl);
      this.getId = getId;
      this.getX = getX;
      this.getY = getY;
      this.getWidth = getWidth;
      this.getHeight = getHeight;
      this.getSrc = getSrc;
      this.getZ = getZ;
      this.deactivate = deactivate;
      windows.push(this);
      sync.update();
      sync.idle();
      activate();
      function windowMessage() {
        return {
          x: x,
          y: y,
          scrollX: scrollX,
          scrollY: scrollY
        };
      }
      function windowReceive(data) {
        activate();
        x = data.x;
        y = data.y;
        scrollX = data.scrollX;
        scrollY = data.scrollY;
        windowEl.style.left = x + 'px'; 
        windowEl.style.top = y + 'px'; 
        windowContentEl.contentWindow.document.body.scrollTop = scrollX;
        windowContentEl.contentWindow.document.body.scrollLeft = scrollY;
      }
      function activate() {
        // TODO: WORRY ABOUT TOO BIG Z
        if (active) {
          return;
        }
        var i;
        var top = BASE;
        for (i = 0; i < windows.length; i++) {
          top = Math.max(top, windows[i].getZ());
          windows[i].deactivate();
        }
        active = true;
        z = top + 1;
        windowEl.style.zIndex = z;
        windowCoverEl.style.visibility = 'hidden';
        windowControlsEl.style.visibility = 'visible';
        windowSync.update();
        windowSync.idle();
      }
      function startMoving(e) {
        moving = true;
        lastX = e.pageX; 
        lastY = e.pageY; 
        windowSync.update();
      }
      function move(e) {
        if (!moving) { 
          return;
        }
        var currentX = e.pageX; 
        var currentY = e.pageY; 
        x = Math.min(x + currentX - lastX, grid.getWidth() - width);
        x = Math.max(x, 0);
        y = Math.min(y + currentY - lastY, grid.getHeight() - (height + BAR_HEIGHT));
        y = Math.max(y, 0);
        windowEl.style.left = x + 'px'; 
        windowEl.style.top = y + 'px'; 
        lastX = currentX;
        lastY = currentY;
        windowSync.update();
      }
      function endMoving() {
        moving = false;
        windowSync.idle();
      }
      function contentLoaded() {
        windowContentEl.contentWindow.document.addEventListener('scroll', scrolling);
        function scrolling() {
          if (!startScrolling) {
            window.setTimeout(checkScrolling, 1000); 
            startScrolling = true;
          }
          endScrolling = false;
          scrollX = windowContentEl.contentWindow.document.body.scrollTop;
          scrollY = windowContentEl.contentWindow.document.body.scrollLeft;
          windowSync.update();
          function checkScrolling() {
            if (endScrolling) {
              startScrolling = false;
              windowSync.idle();
            } else {
              endScrolling = true;
              window.setTimeout(checkScrolling, 1000); 
            }
          }
        }
      }
      function getId() {
        return id;
      }
      function getX() {
        return x;
      }
      function getY() {
        return y;
      }
      function getWidth() {
        return width;
      }
      function getHeight() {
        return height;
      }
      function getSrc() {
        return src;
      }
      function getZ() {
        return z;
      }
      function deactivate() {
        active = false;
        windowCoverEl.style.visibility = 'visible';
        windowControlsEl.style.visibility = 'hidden';
      }
    }
    function getWindowId(obj) {
      return obj.getId();
    }
  }
})();

