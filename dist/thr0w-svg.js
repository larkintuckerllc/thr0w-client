(function() {
  // jscs:disable
  /**
  * This module provides tools to manage SVGs.
  * @module thr0w-svg
  */
  // jscs:enable
  'use strict';
  if (window.thr0w === undefined) {
    throw 400;
  }
  var service = {};
  service.manage = manage;
  // jscs:disable
  /**
  * This object provides SVG management functionality.
  * @namespace thr0w
  * @class svg
  * @static
  */
  // jscs:enable
  window.thr0w.svg = service;
  // jscs:disable
  /**
  * This function manages a SVG; initially scales them to fit and then
  * handles panning and zooming.
  * @method manage
  * @static
  * @param grid {Object} The grid, {{#crossLink "thr0w.Grid"}}thr0w.Grid{{/crossLink}}, object.
  * @param svg {Object} The SVG DOM object.
  * @param max {Integer} The maximum zoom factor.
  */
  // jscs:enable
  function manage(grid, svgEl, max) {
    if (!grid || typeof grid !== 'object') {
      throw 400;
    }
    if (!svgEl || typeof svgEl !== 'object') {
      throw 400;
    }
    if (max === undefined || typeof max !== 'number' || max < 1) {
      throw 400;
    }
    var contentEl = grid.getContent();
    var palatteEl = document.createElement('div');
    palatteEl.classList.add('thr0w_svg_palette');
    // jscs:disable
    palatteEl.innerHTML = [
      '<div class="thr0w_svg_palette__row">',
      '<div class="thr0w_svg_palette__row__cell thr0w_svg_palette__row__cell--plus">+</div>',
      '</div>',
      '<div class="thr0w_svg_palette__row">',
      '<div class="thr0w_svg_palette__row__cell thr0w_svg_palette__row__cell--minus">-</div>',
      '</div>'
    ].join('\n');
    // jscs:enable
    contentEl.appendChild(palatteEl);
    var svgElWidth = svgEl.offsetWidth;
    var svgElHeight = svgEl.offsetHeight;
    var svgViewBox = svgEl.getAttribute('viewBox').split(' ');
    var svgWidth = svgViewBox[2];
    var svgHeight = svgViewBox[3];
    var factorX = svgWidth / svgElWidth;
    var factorY = svgHeight / svgElHeight;
    var scaledSvgWidth = factorX < factorY ? Math.floor(svgHeight *
      svgElWidth / svgElHeight) : svgWidth;
    var scaledSvgHeight = factorY < factorX ? Math.floor(svgWidth *
      svgElHeight / svgElWidth) : svgHeight;
    var left = 0;
    var top = 0;
    var width = scaledSvgWidth;
    var height = scaledSvgHeight;
    var zoomLevel = 1;
    var touchOneLastX;
    var touchOneLastY;
    var touchStartRadius;
    var touchStartZoomLevel;
    var mousePanning = false;
    var mouseLastX;
    var mouseLastY;
    var sync = new window.thr0w.Sync(
      grid,
      'thr0w_svg_' + contentEl.id,
      message,
      receive
      );
    svgEl.addEventListener('mousedown', handleMouseDown);
    svgEl.addEventListener('mousemove', handleMouseMove);
    svgEl.addEventListener('mouseup', handleMouseEnd);
    svgEl.addEventListener('mouseleave', handleMouseEnd);
    svgEl.addEventListener('touchstart', handleTouchStart);
    svgEl.addEventListener('touchmove', handleTouchMove);
    svgEl.addEventListener('touchend', handleTouchEnd);
    palatteEl.querySelector('.thr0w_svg_palette__row__cell--plus')
      .addEventListener('click', zoomIn);
    palatteEl.querySelector('.thr0w_svg_palette__row__cell--minus')
      .addEventListener('click', zoomOut);
    setSVGViewBox();
    function message() {
      return {
        left: left,
        top: top,
        width: width,
        height: height,
        zoomLevel: zoomLevel
      };
    }
    function receive(data) {
      left = data.left;
      top = data.top;
      width = data.width;
      height = data.height;
      zoomLevel = data.zoomLevel;
      setSVGViewBox();
    }
    function handleMouseDown(e) {
      mousePanning = true;
      mouseLastX = e.pageX;
      mouseLastY = e.pageY;
      sync.update();
    }
    function handleMouseMove(e) {
      if (mousePanning) {
        var mouseCurrentX = e.pageX;
        var mouseCurrentY = e.pageY;
        var shiftX;
        var shiftY;
        shiftX = -1 * (mouseCurrentX - mouseLastX) *
          (scaledSvgWidth / svgElWidth) / zoomLevel;
        shiftY = -1 * (mouseCurrentY - mouseLastY) *
          (scaledSvgHeight / svgElHeight) / zoomLevel;
        pan(shiftX, shiftY);
        mouseLastX = mouseCurrentX;
        mouseLastY = mouseCurrentY;
        sync.update();
      }
    }
    function handleMouseEnd() {
      mousePanning = false;
      sync.idle();
    }
    function handleTouchStart(e) {
      touchOneLastX = e.touches[0].pageX;
      touchOneLastY = e.touches[0].pageY;
      if (e.touches.length === 2) {
        touchStartRadius = Math.floor(Math.sqrt(
          Math.pow(touchOneLastX - e.touches[1].pageX, 2) +
          Math.pow(touchOneLastY - e.touches[1].pageY, 2)
        ));
        touchStartZoomLevel = zoomLevel;
      }
      if (e.touches.length === 1) {
        sync.update();
      }
    }
    function handleTouchMove(e) {
      var touchOneCurrentX = e.touches[0].pageX;
      var touchOneCurrentY = e.touches[0].pageY;
      var touchCurrentRadius;
      var shiftX;
      var shiftY;
      if (e.touches.length === 1) {
        shiftX = -1 * (touchOneCurrentX - touchOneLastX) *
          (scaledSvgWidth / svgElWidth) / zoomLevel;
        shiftY = -1 * (touchOneCurrentY - touchOneLastY) *
          (scaledSvgHeight / svgElHeight) / zoomLevel;
        pan(shiftX, shiftY);
      } else {
        touchCurrentRadius = Math.floor(Math.sqrt(
          Math.pow(touchOneCurrentX - e.touches[1].pageX, 2) +
          Math.pow(touchOneCurrentY - e.touches[1].pageY, 2)
        ));
        zoom(touchStartZoomLevel * touchCurrentRadius / touchStartRadius);
      }
      touchOneLastX = touchOneCurrentX;
      touchOneLastY = touchOneCurrentY;
      sync.update();
    }
    function handleTouchEnd(e) {
      e.preventDefault();
      if (e.touches.length === 1) {
        touchOneLastX = e.touches[0].pageX;
        touchOneLastY = e.touches[0].pageY;
      }
      if (e.touches.length === 0) {
        sync.idle();
      }
    }
    function zoomIn() {
      zoom(zoomLevel + 0.5);
      sync.update();
      sync.idle();
    }
    function zoomOut() {
      zoom(zoomLevel - 0.5);
      sync.update();
      sync.idle();
    }
    function pan(shiftX, shiftY) {
      if (shiftX >= 0) {
        left = left + shiftX <= scaledSvgWidth - width ?
          left + shiftX : scaledSvgWidth - width;
      } else {
        left = left + shiftX > 0 ? left + shiftX : 0;
      }
      if (shiftY >= 0) {
        top = top + shiftY <= scaledSvgHeight - height ?
          top + shiftY :  scaledSvgHeight - height;
      } else {
        top = top + shiftY > 0 ? top + shiftY : 0;
      }
      setSVGViewBox();
    }
    function zoom(factor) {
      zoomLevel = Math.max(Math.min(factor, max), 1);
      var centerX = left + width / 2;
      var centerY = top + height / 2;
      width = scaledSvgWidth / zoomLevel;
      height = scaledSvgHeight / zoomLevel;
      left = Math.max(centerX - width / 2, 0);
      left = Math.min(left, scaledSvgWidth - width);
      top = Math.max(centerY - height / 2, 0);
      top = Math.min(top, scaledSvgHeight - height);
      setSVGViewBox();
    }
    function setSVGViewBox() {
      svgEl.setAttribute('viewBox', left + ' ' + top +
        ' ' + width + ' ' + height);
    }
  }
})();
