(function() {
  // jscs:disable
  /**
  * This module provides a window manager.
  * @module thr0w-windows
  */
  // jscs:enable
  'use strict';
  if (window.thr0w === undefined) {
    throw 400;
  }
  var service = {};
  service.WindowManager = WindowManager;
  // jscs:disable
  /**
  * This object provides the window management functionality.
  * @namespace thr0w
  * @class windows
  * @static
  */
  // jscs:enable
  window.thr0w.windows = service;
  // jscs:disable
  /**
  * This class is used to create window managers.
  * @namespace thr0w.windows
  * @class WindowManager
  * @constructor
  * @param id {String} The id.
  * @param grid {Object} The grid, {{#crossLink "thr0w.Grid"}}Thr0w.Grid{{/crossLink}}, object.
  */
  // jscs:enable
  function WindowManager(wmId, grid) {
    if (wmId === undefined || typeof wmId !== 'string') {
      throw 400;
    }
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
    this.openWindow = openWindow;
    this.closeWindow = closeWindow;
    this.closeAllWindows = closeAllWindows;
    this.addEventListener = addEventListener;
    this.removeEventListener = removeEventListener;
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
      var dataIds = data.map(getDataId);
      var windowIds = windows.map(getWindowId);
      var i;
      var id;
      var j;
      var w;
      var orderedWindows = [];
      // WINDOW NOT IN DATA
      for (i = 0; i < windows.length; i++) {
        w = windows[i];
        id = w.getId();
        if (dataIds.indexOf(id) === -1) {
          windows.splice(i, 1);
          w.destroy();
          closeWindowEvent(id);
        }
      }
      // DATA NOT IN WINDOWS
      for (i = 0; i < data.length; i++) {
        if (windowIds.indexOf(data[i].id) === -1) {
          windows.push(new Window(data[i].id, data[i].x,
            data[i].y, data[i].width, data[i].height, data[i].src));
        }
      }
      // RESETTING WINDOWS ORDER
      for (i = 0; i < dataIds.length; i++) {
        for (j = 0; j < windows.length; j++) {
          w = windows[j];
          if (w.getId() === dataIds[i]) {
            w.deactivate();
            orderedWindows.push(w);
            windows.splice(j, 1);
            break;
          }
        }
      }
      windows = orderedWindows;
      stackWindows();
      function getDataId(obj) {
        return obj.id;
      }
    }
    // jscs:disable
    /**
    * This method is used to create windows; max windows = 100;
    * @method openWindow
    * @param id {String} The id.
    * @param x {Integer} The horizontal position; min = 0, max = grid content width - width.
    * @param y {Integer} The vertical position; min = 0, max = grid content height - height.
    * @param width {Integer} The width; min = 140px.
    * @param height {Integer} The height; min = 55px.
    * @param src {String} The source url.
    */
    // jscs:enable
    function openWindow(id, x, y, width, height, src) {
      if (windows.length > 99) {
        throw 400;
      }
      if (windows.map(getWindowId).indexOf(id) !== -1) {
        throw 400;
      }
      if (id === undefined || typeof id !== 'string') {
        throw 400;
      }
      if (x === undefined || typeof x !== 'number' || x < 0) {
        throw 400;
      }
      if (y === undefined || typeof y !== 'number' || y < 0) {
        throw 400;
      }
      if (width === undefined || typeof width !== 'number' || width < 140) {
        throw 400;
      }
      if (height === undefined || typeof height !== 'number' ||
        height < 55) {
        throw 400;
      }
      if (src === undefined || typeof src !== 'string') {
        throw 400;
      }
      if (x + width > grid.getWidth()) {
        throw 400;
      }
      if (y + height > grid.getHeight()) {
        throw 400;
      }
      var i;
      for (i = 0; i < windows.length; i++) {
        windows[i].deactivate();
      }
      windows.push(new Window(id, x, y, width,
        height, src));
      stackWindows();
      sync.update();
      sync.idle();
    }
    // jscs:disable
    /**
    * This method is used to close windows.
    * @method closeWindow
    * @param id {String} The id.
    */
    // jscs:enable
    function closeWindow(id) {
      if (id === undefined || typeof id !== 'string') {
        throw 400;
      }
      var i = windows.map(getWindowId).indexOf(id);
      if (i === -1) {
        throw 400;
      }
      var w = windows[i];
      windows.splice(i, 1);
      w.destroy();
      stackWindows();
      sync.update();
      sync.idle();
      closeWindowEvent(id);
    }
    // jscs:disable
    /**
    * This method is used to close all windows.
    * @method closeAllWindows
    */
    // jscs:enable
    function closeAllWindows() {
      var i;
      for (i = windows.length - 1; i >= 0; i--) {
        closeWindow(windows[i].getId());
      }
    }
    // jscs:disable
    /**
    * This method is used to register listeners
    * @method addEventListener
    * @param type {String} Name of the event.
    * @param listener {Function} Listening function.
    */
    // jscs:enable
    function addEventListener(type, listener) {
      document.addEventListener(
        'thr0w_windows_' + type,
        listener
      );
    }
    // jscs:disable
    /**
    * This method is used to deregister listeners
    * @method removeEventListener
    * @param type {String} Name of the event.
    * @param listener {Function} Listening function.
    */
    // jscs:enable
    function removeEventListener(type, listener) {
      document.removeEventListener(
        'thr0w_windows_' + type,
        listener
      );
    }
    function getWindowId(obj) {
      return obj.getId();
    }
    function stackWindows() {
      var i;
      for (i = 0; i < windows.length; i++) {
        windows[i].setZ(800 + i);
      }
      i = windows.length - 1;
      if (i !== -1) {
        windows[i].activate();
      }
    }
    function closeWindowEvent(id) {
      // jscs:disable
      /**
      * Window closed.
      *
      * @event window_closed
      * @param {String} wmid The {{#crossLink "thr0w.windows.WindowManager"}}thr0w.windows.WindowManager{{/crossLink}} object's id.
      * @param {String} id The window's id.
      */
      // jscs:enable
      document.dispatchEvent(new CustomEvent('thr0w_windows_window_closed',
        {detail: {wmid: wmId, id: id}}));
    }
    function Window(id, x, y, width, height, src) {
      var frameEl = grid.getFrame();
      var offsetLeft = frameEl.offsetLeft + contentEl.offsetLeft;
      var offsetTop = frameEl.offsetTop + contentEl.offsetTop;
      var active = true;
      var closing = false;
      var lastX;
      var lastY;
      var mousePanning = false;
      var scrollX = 0;
      var scrollY = 0;
      var startScrolling = false;
      var endScrolling = true;
      var windowEl = document.createElement('div');
      var windowBarEl;
      var windowControlsEl;
      var windowControlsCloseEl;
      var windowContentEl;
      var windowCoverEl;
      var windowSync = new window.thr0w.Sync(
        grid,
        'thr0w_windows_' + contentEl.id + '_' + id,
        windowMessage,
        windowReceive
        );
      windowEl.id = id;
      windowEl.style.left = x + 'px';
      windowEl.style.top = y + 'px';
      windowEl.style.width = width + 'px';
      windowEl.style.height = height + 'px';
      windowEl.classList.add('thr0w_windows_window');
      // jscs:disable
      windowEl.innerHTML = [
        '<div class="thr0w_windows_window__bar">',
        '<div class="thr0w_windows_window__bar__controls">',
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg" viewbox="0 0 100 100" class="thr0w_windows_window__bar__controls__control thr0w_windows_window__bar__controls__control--close">',
        '<g>',
        '<ellipse stroke="#000000" ry="49" rx="49" id="svg_1" cy="50" cx="50" stroke-width="2" fill="#ffffff"/>',
        '<path id="svg_4" fill-opacity="1" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="2" stroke="#808080" fill="#808080"/>',
        '<path id="svg_6" d="m13.75,30.5l18.5,18.75l-19.5,20.25l17.25,16.75l20.5,-19l19.25,19.5l17.25,-17l-19.5,-19.25l19.75,-19.75l-17.5,-17.5l-19.25,20l-19.5,-20l-17.25,17.25z" fill-opacity="1" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="2" stroke="#808080" fill="#808080"/>',
        '</g>',
        '</svg>',
        '</div>',
        '</div>',
        '<iframe src="' + src + '" width="' + (width - 2) + '" height="' + (height - 52) + '" frameborder="0" class="thr0w_windows_window__content">',
        '</iframe>',
        '<div style="width: '  + (width - 2) + 'px; height: ' + (height - 52) +'px;" class="thr0w_windows_window__cover"></div>',
      ].join('\n');
      // jscs:enable
      windowEl.addEventListener('mousedown', sendSelfToTop);
      windowEl.addEventListener('touchstart', sendSelfToTop);
      windowBarEl = windowEl.querySelector('.thr0w_windows_window__bar');
      windowBarEl.addEventListener('mousedown', handleMouseDown);
      windowBarEl.addEventListener('mousemove', handleMouseMove);
      windowBarEl.addEventListener('mouseup', handleMouseEnd);
      windowBarEl.addEventListener('mouseleave', handleMouseEnd);
      windowBarEl.addEventListener('touchstart', handleTouchStart);
      windowBarEl.addEventListener('touchmove', handleTouchMove);
      windowBarEl.addEventListener('touchend', handleTouchEnd);
      windowControlsEl = windowEl
        .querySelector('.thr0w_windows_window__bar__controls');
      windowControlsEl.style.visibility = 'visible';
      windowControlsCloseEl = windowControlsEl
        .querySelector('.thr0w_windows_window__bar__controls__control--close');
      windowControlsCloseEl.addEventListener('mousedown',
        handleCloseMouseDown, true);
      windowControlsCloseEl.addEventListener('touchstart',
        handleCloseTouchStart, true);
      windowContentEl = windowEl
        .querySelector('.thr0w_windows_window__content');
      windowContentEl.addEventListener('load', contentLoaded);
      windowCoverEl = windowEl.querySelector('.thr0w_windows_window__cover');
      windowCoverEl.style.visibility = 'hidden';
      contentEl.appendChild(windowEl);
      this.getId = getId;
      this.getX = getX;
      this.getY = getY;
      this.getWidth = getWidth;
      this.getHeight = getHeight;
      this.getSrc = getSrc;
      this.activate = activate;
      this.deactivate = deactivate;
      this.destroy = destroy;
      this.setZ = setZ;
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
        positionWindow(x, y, scrollX, scrollY);
      }
      function sendSelfToTop() {
        if (active) {
          return;
        }
        var i;
        var j;
        var w;
        for (i = 0; i < windows.length; i++) {
          windows[i].deactivate();
          if (windows[i].getId() === id) {
            j = i;
            w = windows[i];
          }
        }
        windows.splice(j, 1);
        windows.push(w);
        stackWindows();
        sync.update();
        sync.idle();
      }
      function handleMouseDown(e) {
        if (closing) {
          return;
        }
        mousePanning = true;
        lastX = e.pageX - offsetLeft;
        lastY = e.pageY - offsetTop;
        windowSync.update();
      }
      function handleMouseMove(e) {
        if (!mousePanning) {
          return;
        }
        var currentX;
        var currentY;
        currentX = e.pageX - offsetLeft;
        currentY = e.pageY - offsetTop;
        x = Math.min(x + currentX - lastX, grid.getWidth() - width);
        x = Math.max(x, 0);
        y = Math.min(y + currentY - lastY, grid.getHeight() - height);
        y = Math.max(y, 0);
        positionWindow(x, y, scrollX, scrollY);
        lastX = currentX;
        lastY = currentY;
        windowSync.update();
      }
      function handleMouseEnd() {
        if (!mousePanning) {
          return;
        }
        mousePanning = false;
        windowSync.idle();
      }
      function handleTouchStart(e) {
        e.preventDefault();
        if (closing) {
          return;
        }
        if (e.touches.length === 1) {
          lastX = e.touches[0].pageX - offsetLeft;
          lastY = e.touches[0].pageY - offsetTop;
          windowSync.update();
        }
      }
      function handleTouchMove(e) {
        if (closing) {
          return;
        }
        var currentX;
        var currentY;
        currentX = e.touches[0].pageX - offsetLeft;
        currentY = e.touches[0].pageY - offsetTop;
        x = Math.min(x + currentX - lastX, grid.getWidth() - width);
        x = Math.max(x, 0);
        y = Math.min(y + currentY - lastY, grid.getHeight() - height);
        y = Math.max(y, 0);
        positionWindow(x, y, scrollX, scrollY);
        lastX = currentX;
        lastY = currentY;
        windowSync.update();
      }
      function handleTouchEnd(e) {
        if (closing) {
          return;
        }
        if (e.touches.length === 0) {
          windowSync.idle();
        }
      }
      function handleCloseMouseDown(e) {
        e.stopPropagation();
        e.preventDefault();
        closing = true;
        closeWindow(id);
      }
      function handleCloseTouchStart(e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.touches.length === 1) {
          closing = true;
          closeWindow(id);
        }
      }
      function contentLoaded() {
        windowContentEl.removeEventListener('load', contentLoaded);
        windowContentEl.contentWindow.document
          .addEventListener('scroll', scrolling);
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
      function setZ(z) {
        windowEl.style.zIndex = z;
      }
      function activate() {
        if (active) {
          return;
        }
        active = true;
        windowCoverEl.style.visibility = 'hidden';
        windowControlsEl.style.visibility = 'visible';
      }
      function deactivate() {
        if (!active) {
          return;
        }
        active = false;
        windowControlsEl.style.visibility = 'hidden';
        windowCoverEl.style.visibility = 'visible';
      }
      function destroy() {
        windowEl.removeEventListener('mousedown', sendSelfToTop);
        windowEl.removeEventListener('touchstart', sendSelfToTop);
        windowBarEl.removeEventListener('mousedown', handleMouseDown);
        windowBarEl.removeEventListener('mousemove', handleMouseMove);
        windowBarEl.removeEventListener('mouseup', handleMouseEnd);
        windowBarEl.removeEventListener('mouseleave', handleMouseEnd);
        windowBarEl.removeEventListener('touchstart', handleTouchStart);
        windowBarEl.removeEventListener('touchmove', handleTouchMove);
        windowBarEl.removeEventListener('touchend', handleTouchEnd);
        windowControlsCloseEl
          .removeEventListener('mousedown', handleCloseMouseDown);
        windowControlsCloseEl
          .removeEventListener('touchstart', handleCloseTouchStart);
        windowContentEl.contentWindow.location.href = 'about:blank';
        contentEl.removeChild(windowEl);
        windowSync.destroy();
      }
      function scrolling() {
        if (!startScrolling) {
          window.setTimeout(checkScrolling, 100);
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
            window.setTimeout(checkScrolling, 100);
          }
        }
      }
      function positionWindow(newX, newY, newScrollX, newScrollY) {
        window.requestAnimationFrame(animation);
        function animation() {
          windowEl.style.left = newX + 'px';
          windowEl.style.top = newY + 'px';
          windowContentEl.contentWindow.document.body.scrollTop = newScrollX;
          windowContentEl.contentWindow.document.body.scrollLeft = newScrollY;
        }
      }
    }
  }
})();
