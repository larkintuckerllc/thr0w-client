(function() {
  // jscs:disable
  /**
  * This module provides tools to manage Leaflet maps.
  * @module thr0w-leaflet
  */
  // jscs:enable
  'use strict';
  if (window.thr0w === undefined) {
    throw 400;
  }
  var L = window.L;
  var service = {};
  // jscs:disable
  /**
  * This object provides Leaflet maps management functionality.
  * @namespace thr0w
  * @class leaflet
  * @static
  */
  // jscs:enable
  window.thr0w.leaflet = service;
  service.Map = Map;
  // jscs:disable
  /**
  * This class is used to manage Leaflet maps.
  * @namespace thr0w.leaflet
  * @class Map
  * @constructor
  * @param grid {Object} The grid, {{#crossLink "thr0w.Grid"}}thr0w.Grid{{/crossLink}}, object.
  * @param map {Object} The Leaflet map object.
  */
  // jscs:enable
  function Map(grid, map) {
    if (!grid || typeof grid !== 'object') {
      throw 400;
    }
    if (!map || typeof map !== 'object') {
      throw 400;
    }
    var zoomLevel = map.getZoom();
    var minZoom = map.getMinZoom();
    var maxZoom = map.getMaxZoom();
    var frameEl = grid.getFrame();
    var contentEl = grid.getContent();
    var mousePanning = false;
    var zoomed = false;
    var mouseLastX;
    var mouseLastY;
    var touchOneLastX;
    var touchOneLastY;
    var touchStartRadius;
    var touchEndRadius;
    var touchEndCenterX;
    var touchEndCenterY;
    var handPanning = false;
    var scale = grid.getRowScale();
    var frameOffsetLeft = frameEl.offsetLeft;
    var contentLeft = grid.frameXYToContentXY([0,0])[0];
    var frameOffsetTop = frameEl.offsetTop;
    var contentTop = grid.frameXYToContentXY([0,0])[1];
    var contentCenterX = grid.getWidth() / 2;
    var contentCenterY = grid.getHeight() / 2;
    var centerLatLng = map.containerPointToLatLng(
      L.point(
        contentCenterX,
        contentCenterY
      )
    );
    var palatteEl = document.createElement('div');
    var sync = new window.thr0w.Sync(
      grid,
      'thr0w_svg_' + contentEl.id,
      message,
      receive
    );
    palatteEl.classList.add('thr0w_leaflet_palette');
    // jscs:disable
    palatteEl.innerHTML = [
      '<div class="thr0w_leaflet_palette__row">',
      '<div class="thr0w_leaflet_palette__row__cell thr0w_leaflet_palette__row__cell--plus">+</div>',
      '</div>',
      '<div class="thr0w_leaflet_palette__row">',
      '<div class="thr0w_leaflet_palette__row__cell thr0w_leaflet_palette__row__cell--minus">-</div>',
      '</div>'
    ].join('\n');
    // jscs:enable
    contentEl.appendChild(palatteEl);
    palatteEl.querySelector('.thr0w_leaflet_palette__row__cell--plus')
      .addEventListener('click', zoomIn);
    palatteEl.querySelector('.thr0w_leaflet_palette__row__cell--minus')
      .addEventListener('click', zoomOut);
    frameEl.addEventListener('mousedown', handleMouseDown, true);
    frameEl.addEventListener('mousemove', handleMouseMove, true);
    frameEl.addEventListener('mouseup', handleMouseEnd, true);
    // MOUSELEAVE NOT USED AS LEAFLET HAS LAYERS
    frameEl.addEventListener('touchstart', handleTouchStart, true);
    frameEl.addEventListener('touchmove', handleTouchMove, true);
    frameEl.addEventListener('touchend', handleTouchEnd, true);
    frameEl.addEventListener('touchcancel', handleTouchEnd, true);
    function message() {
      return {
        lat: centerLatLng.lat,
        lng: centerLatLng.lng,
        zoomLevel: zoomLevel
      };
    }
    function receive(data) {
      centerLatLng = L.latLng(data.lat, data.lng);
      zoomLevel = data.zoomLevel;
      map.setView(
        centerLatLng,
        zoomLevel,
        {animate: false}
      );
    }
    function zoomIn() {
      zoom(zoomLevel + 1);
      sync.update();
      sync.idle();
    }
    function zoomOut() {
      zoom(zoomLevel - 1);
      sync.update();
      sync.idle();
    }
    function handleMouseDown(e) {
      e.stopPropagation();
      mousePanning = true;
      mouseLastX = (e.pageX - frameOffsetLeft) * scale + contentLeft;
      mouseLastY = (e.pageY - frameOffsetTop) * scale + contentTop;
      sync.update();
    }
    function handleMouseMove(e) {
      e.stopPropagation();
      if (mousePanning) {
        var mouseCurrentX = (e.pageX - frameOffsetLeft) * scale + contentLeft;
        var mouseCurrentY = (e.pageY - frameOffsetTop) * scale + contentTop;
        pan(
          mouseLastX - mouseCurrentX,
          mouseLastY - mouseCurrentY
        );
        mouseLastX =  mouseCurrentX;
        mouseLastY = mouseCurrentY;
        sync.update();
      }
    }
    function handleMouseEnd(e) {
      e.stopPropagation();
      if (mousePanning) {
        mousePanning = false;
        sync.idle();
      }
    }
    function handleTouchStart(e) {
      var touchOneX;
      var touchOneY;
      var touchTwoX;
      var touchTwoY;
      e.stopPropagation();
      touchOneX = (e.touches[0].pageX - frameOffsetLeft) *
        scale + contentLeft;
      touchOneLastX = touchOneX;
      touchOneY = (e.touches[0].pageY - frameOffsetTop) *
        scale + contentTop;
      touchOneLastY = touchOneY;
      if (e.touches.length > 2) {
        handPanning = true;
      }
      if (e.touches.length === 2) {
        touchTwoX = (e.touches[1].pageX - frameOffsetLeft) *
          scale + contentLeft;
        touchTwoY = (e.touches[1].pageY - frameOffsetTop) *
          scale + contentTop;
        touchStartRadius = Math.floor(Math.sqrt(
          Math.pow(touchOneX - touchTwoX, 2) +
          Math.pow(touchOneY - touchTwoY, 2)
        ));
        touchEndRadius = touchStartRadius;
        touchEndCenterX = (touchOneX + touchTwoX) / 2;
        touchEndCenterY = (touchOneY + touchTwoY) / 2;
      }
      if (e.touches.length === 1) {
        handPanning = false;
        zoomed = false;
        sync.update();
      }
    }
    function handleTouchMove(e) {
      if (zoomed) { // MAKING EXPLICT ALREADY IMPLICIT BEHAVIOR
        return;
      }
      var touchOneX;
      var touchOneY;
      var touchTwoX;
      var touchTwoY;
      e.stopPropagation();
      touchOneX = (e.touches[0].pageX - frameOffsetLeft) *
        scale + contentLeft;
      touchOneY = (e.touches[0].pageY - frameOffsetTop) *
        scale + contentTop;
      if (!handPanning && e.touches.length === 2) {
        touchTwoX = (e.touches[1].pageX - frameOffsetLeft) *
          scale + contentLeft;
        touchTwoY = (e.touches[1].pageY - frameOffsetTop) *
          scale + contentTop;
        touchEndRadius = Math.floor(Math.sqrt(
          Math.pow(touchOneX - touchTwoX, 2) +
          Math.pow(touchOneY - touchTwoY, 2)
        ));
        touchEndCenterX = (touchOneX + touchTwoX) / 2;
        touchEndCenterY = (touchOneY + touchTwoY) / 2;
      } else {
        pan(
          touchOneLastX - touchOneX,
          touchOneLastY - touchOneY
        );
        sync.update();
      }
      touchOneLastX = touchOneX;
      touchOneLastY = touchOneY;
    }
    function handleTouchEnd(e) {
      e.stopPropagation();
      if (zoomed) {
        return;
      }
      if (e.touches.length === 1) {
        if (!handPanning) {
          zoomed = true;
          centerLatLng = map.containerPointToLatLng(
            L.point(touchEndCenterX, touchEndCenterY)
          );
          if (touchEndRadius > touchStartRadius) {
            zoom(zoomLevel + 1);
          } else {
            zoom(zoomLevel - 1);
          }
          sync.update();
          sync.idle();
        }
      }
      if (e.touches.length === 0) {
        sync.idle();
      }
    }
    function pan(shiftX, shiftY) {
      var lat = centerLatLng.lat;
      if (lat > 80 && shiftY < 0) {
        return;
      }
      if (lat < -80 && shiftY > 0) {
        return;
      }
      centerLatLng = map.containerPointToLatLng(
        L.point(
          contentCenterX + shiftX,
          contentCenterY + shiftY
        )
      );
      map.setView(
        centerLatLng,
        zoomLevel,
        {animate: false}
      );
    }
    function zoom(level) {
      level = level <= maxZoom ? level : maxZoom;
      level = level >= minZoom ? level : minZoom;
      zoomLevel = level;
      map.setView(
        centerLatLng,
        zoomLevel,
        {animate: false}
      );
    }
  }
})();
