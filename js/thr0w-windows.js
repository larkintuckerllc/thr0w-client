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
          new Window(data[i].id, data[i].x, data[i].y);
        }
      }
      function getWindowId(obj) {
        return obj.getId();
      }
    }
    /**
    * This class is used to create windows.
    * @namespace thr0w.windows.WindowManager
    * @class Window
    * @constructor
    * @param id {Object} The id.
    * @param x {Object} The x.
    * @param y {Object} The y.
    */
    function Window(id, x, y) {
      if (id === undefined || typeof id !== 'string') {
       throw 400;
      } 
      if (x === undefined || typeof x !== 'number') {
        throw 400;
      }
      if (y === undefined || typeof y !== 'number') {
        throw 400;
      }
      // TODO PARAMS
      var windowWidth = 200;
      var windowHeight = 300;
      var windowSrc = '/client/doc/';
      //
      var lastX;
      var lastY;
      var moving = false;
      var scrollX = 0;
      var scrollY = 0;
      var startScrolling = false;
      var endScrolling = true;
      var windowEl = document.createElement('div');
      var windowBarEl;
      var windowContentEl;
      var windowSync = new window.thr0w.Sync(
        grid,
        'thr0w_windows_' + contentEl.id + '_' + id,
        windowMessage,
        windowReceive
        );
      windowEl.style.left = x + 'px';
      windowEl.style.top = y + 'px';
      windowEl.style.width = windowWidth + 'px';
      windowEl.style.height = windowHeight + 'px';
      windowEl.classList.add('thr0w_windows_window');
      windowEl.innerHTML = [
        '<div class="thr0w_windows_window__bar">',
        '</div>',
        '<iframe src="/client/doc/" width="200" height="260" frameborder="0" class="thr0w_windows_window__content">',
        '</iframe>'].join('\n');
      windowBarEl = windowEl.querySelector('.thr0w_windows_window__bar');
      windowBarEl.addEventListener('mousedown', startMoving);
      windowBarEl.addEventListener('mousemove', move);
      windowBarEl.addEventListener('mouseup', endMoving);
      windowBarEl.addEventListener('mouseleave', endMoving);
      windowContentEl = windowEl.querySelector('.thr0w_windows_window__content');
      windowContentEl.addEventListener('load', contentLoaded);
      contentEl.appendChild(windowEl);
      this.getId = getId;
      this.getX = getX;
      this.getY = getY;
      this.getWidth = getWidth;
      this.getHeight = getHeight;
      this.getSrc = getSrc;
      windows.push(this);
      sync.update();
      sync.idle();
      function windowMessage() {
        return {
          x: x,
          y: y,
          scrollX: scrollX,
          scrollY: scrollY
        };
      }
      function windowReceive(data) {
        x = data.x;
        y = data.y;
        scrollX = data.scrollX;
        scrollY = data.scrollY;
        windowEl.style.left = x + 'px'; 
        windowEl.style.top = y + 'px'; 
        windowContentEl.contentWindow.document.body.scrollTop = scrollX;
        windowContentEl.contentWindow.document.body.scrollLeft = scrollY;
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
        x = Math.min(x + currentX - lastX, grid.getWidth() - windowWidth);
        x = Math.max(x, 0);
        y = Math.min(y + currentY - lastY, grid.getHeight() - windowHeight);
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
      /**
      * This function returns the window's id.
      * @method getId
      * @return {String} The window's id.
      */
      function getId() {
        return id;
      }
      /**
      * This function returns the window's horizontal position.
      * @method getX
      * @return {Integer} The window's horizontal position.
      */
      function getX() {
        return x;
      }
      /**
      * This function returns the window's vertical position.
      * @method getY
      * @return {Integer} The window's vertical position.
      */
      function getY() {
        return y;
      }
      /**
      * This function returns the window's width.
      * @method getWidth
      * @return {Integer} The window's width.
      */
      function getWidth() {
        return windowWidth;
      }
      /**
      * This function returns the window's height.
      * @method getHeight
      * @return {Integer} The window's height.
      */
      function getHeight() {
        return windowHeight;
      }
      /**
      * This function returns the window's src.
      * @method getSrc
      * @return {String} The window's src.
      */
      function getSrc() {
        return windowSrc;
      }
    }
  }
})();

