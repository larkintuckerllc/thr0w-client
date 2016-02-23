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
    var frameEl = grid.getFrame();
    var contentEl = grid.getContent();
    var svgElWidth = grid.getWidth();
    var svgElHeight = grid.getHeight();
    var scale = grid.getRowScale();
    var offsetLeft = frameEl.offsetLeft -
      frameEl.offsetWidth / scale * (1 - scale) / 2 +
      contentEl.offsetLeft;
    var offsetTop = frameEl.offsetTop -
      frameEl.offsetHeight / scale * (1 - scale) / 2 +
      contentEl.offsetTop;
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
    var touchTwoLastX;
    var touchTwoLastY;
    var mousePanning = false;
    var mouseLastX;
    var mouseLastY;
    var handPanning = false;
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
      .addEventListener('mousedown', zoomIn);
    palatteEl.querySelector('.thr0w_svg_palette__row__cell--plus')
      .addEventListener('touchstart', zoomIn);
    palatteEl.querySelector('.thr0w_svg_palette__row__cell--minus')
      .addEventListener('mousedown', zoomOut);
    palatteEl.querySelector('.thr0w_svg_palette__row__cell--minus')
      .addEventListener('touchstart', zoomOut);
    setSVGViewBox(left, top, width, height);
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
      setSVGViewBox(left, top, width, height);
    }
    function handleMouseDown(e) {
      e.preventDefault();
      mousePanning = true;
      mouseLastX = e.pageX * scale - offsetLeft;
      mouseLastY = e.pageY * scale - offsetTop;
      sync.update();
    }
    function handleMouseMove(e) {
      if (mousePanning) {
        var mouseCurrentX = e.pageX * scale - offsetLeft;
        var mouseCurrentY = e.pageY * scale - offsetTop;
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
      e.preventDefault();
      touchOneLastX = e.touches[0].pageX * scale - offsetLeft;
      touchOneLastY = e.touches[0].pageY * scale - offsetTop;
      if (e.touches.length > 2) {
        handPanning = true;
      }
      if (e.touches.length === 2) {
        touchTwoLastX = e.touches[1].pageX * scale - offsetLeft;
        touchTwoLastY = e.touches[1].pageY * scale - offsetTop;
      }
      if (e.touches.length === 1) {
        sync.update();
      }
    }
    function handleTouchMove(e) {
      var touchOneCurrentX = e.touches[0].pageX * scale - offsetLeft;
      var touchOneCurrentY = e.touches[0].pageY * scale - offsetTop;
      var touchTwoCurrentX;
      var touchTwoCurrentY;
      var touchLeftLast;
      var touchLeftCurrent;
      var touchRightLast;
      var touchRightCurrent;
      var touchTopLast;
      var touchTopCurrent;
      var touchBottomLast;
      var touchBottomCurrent;
      var shiftX;
      var shiftY;
      var newWidth;
      var newHeight;
      var leftPosition;
      var topPosition;
      var touchRadiusCurrent;
      var touchRadiusLast;
      if (!handPanning && e.touches.length === 2) {
        touchTwoCurrentX = e.touches[1].pageX * scale - offsetLeft;
        touchTwoCurrentY = e.touches[1].pageY * scale - offsetTop;
        // DECIDING LEFT - RIGHT - TOP - BOTTOM
        if (touchOneCurrentX < touchTwoCurrentX) {
          touchLeftLast = touchOneLastX;
          touchLeftCurrent = touchOneCurrentX;
          touchRightLast = touchTwoLastX;
          touchRightCurrent = touchTwoCurrentX;
        } else {
          touchLeftLast = touchTwoLastX;
          touchLeftCurrent = touchTwoCurrentX;
          touchRightLast = touchOneLastX;
          touchRightCurrent = touchOneCurrentX;
        }
        if (touchOneCurrentY < touchTwoCurrentY) {
          touchTopLast = touchOneLastY;
          touchTopCurrent = touchOneCurrentY;
          touchBottomLast = touchTwoLastY;
          touchBottomCurrent = touchTwoCurrentY;
        } else {
          touchTopLast = touchTwoLastY;
          touchTopCurrent = touchTwoCurrentY;
          touchBottomLast = touchOneLastY;
          touchBottomCurrent = touchOneCurrentY;
        }
        // SHIFTING LEFT AND TOP BASED ON LAST ZOOM
        shiftX = -1 * (touchLeftCurrent - touchLeftLast) *
          (scaledSvgWidth / svgElWidth) / zoomLevel;
        shiftY = -1 * (touchTopCurrent - touchTopLast) *
          (scaledSvgWidth / svgElWidth) / zoomLevel;
        left += shiftX;
        top += shiftY;
        // CALCULATING ZOOM
        touchRadiusLast = Math.floor(Math.sqrt(
          Math.pow(touchLeftLast - touchRightLast, 2) +
          Math.pow(touchTopLast - touchBottomLast, 2)
        ));
        touchRadiusCurrent = Math.floor(Math.sqrt(
          Math.pow(touchLeftCurrent - touchRightCurrent, 2) +
          Math.pow(touchTopCurrent - touchBottomCurrent, 2)
        ));
        zoomLevel = Math.max(
          Math.min(
            zoomLevel * touchRadiusCurrent / touchRadiusLast,
            max
          ),
          1
        );
        newWidth = scaledSvgWidth / zoomLevel;
        newHeight = scaledSvgHeight / zoomLevel;
        // SHIFTING LEFT AND TOP BASED ON CURRENT ZOOM
        leftPosition = touchLeftCurrent / svgElWidth * width;
        left = leftPosition + left - leftPosition * newWidth / width;
        topPosition = touchTopCurrent / svgElHeight * height;
        top = topPosition + top - topPosition * newHeight / height;
        width = newWidth;
        height = newHeight;
        // KEEPING LEFT AND TOP IN BOUNDS
        left = Math.max(left, 0);
        left = Math.min(left, scaledSvgWidth - width);
        top = Math.max(top, 0);
        top = Math.min(top, scaledSvgHeight - height);
        // FINISH
        setSVGViewBox(left, top, width, height);
        touchTwoLastX = touchTwoCurrentX;
        touchTwoLastY = touchTwoCurrentY;
      } else {
        shiftX = -1 * (touchOneCurrentX - touchOneLastX) *
          (scaledSvgWidth / svgElWidth) / zoomLevel;
        shiftY = -1 * (touchOneCurrentY - touchOneLastY) *
          (scaledSvgHeight / svgElHeight) / zoomLevel;
        pan(shiftX, shiftY);
      }
      touchOneLastX = touchOneCurrentX;
      touchOneLastY = touchOneCurrentY;
      sync.update();
    }
    function handleTouchEnd(e) {
      if (e.touches.length === 1) {
        touchOneLastX = e.touches[0].pageX * scale - offsetLeft;
        touchOneLastY = e.touches[0].pageY * scale - offsetTop;
      }
      if (e.touches.length === 0) {
        handPanning = false;
        sync.idle();
      }
    }
    function zoomIn(e) {
      e.preventDefault();
      zoom(zoomLevel + 0.5);
      sync.update();
      sync.idle();
    }
    function zoomOut(e) {
      e.preventDefault();
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
      setSVGViewBox(left, top, width, height);
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
      setSVGViewBox(left, top, width, height);
    }
    function setSVGViewBox(newLeft, newTop, newWidth, newHeight) {
      window.requestAnimationFrame(animation);
      function animation() {
        svgEl.setAttribute('viewBox', newLeft + ' ' + newTop +
          ' ' + newWidth + ' ' + newHeight);
      }
    }
  }
})();
