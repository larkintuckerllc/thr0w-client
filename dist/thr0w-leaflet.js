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
  var MAX_LAT = 80;
  var MIN_LAT = -80;
  var INTERVAL = 33;
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
    var syncing = false;
    var iAmSyncing = false;
    var animationSyncing = false;
    var iAmAnimationSyncing = false;
    var nextMove = false;
    var nextMoveDuration;
    var nextMoveLat;
    var nextMoveLng;
    var nextMoveZ;
    var moveAnimationInterval = null;
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
      'thr0w_leaflet_' + contentEl.id,
      message,
      receive
    );
    var animationSync = new window.thr0w.Sync(
      grid,
      'thr0w_leaflet_animation_' + contentEl.id,
      message,
      receive,
      true
    );
    var oobSync = new window.thr0w.Sync(
      grid,
      'thr0w_leaflet_oob_' + contentEl.id,
      messageOob,
      receiveOob
    );
    this.moveTo = moveTo;
    this.moveStop = moveStop;
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
    contentEl.addEventListener('mousedown', handleMouseDown, true);
    contentEl.addEventListener('mousemove', handleMouseMove, true);
    contentEl.addEventListener('mouseup', handleMouseEnd, true);
    // MOUSELEAVE NOT USED AS LEAFLET HAS LAYERS
    contentEl.addEventListener('touchstart', handleTouchStart, true);
    contentEl.addEventListener('touchmove', handleTouchMove, true);
    contentEl.addEventListener('touchend', handleTouchEnd, true);
    contentEl.addEventListener('touchcancel', handleTouchEnd, true);
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
    function messageOob() {
      return {
        syncing: syncing,
        animationSyncing: animationSyncing,
        nextMove: nextMove,
        nextMoveDuration: nextMoveDuration,
        nextMoveLat: nextMoveLat,
        nextMoveLng: nextMoveLng,
        nextMoveZ: nextMoveZ
      };
    }
    function receiveOob(data) {
      syncing = data.syncing;
      animationSyncing = data.animationSyncing;
      if (iAmSyncing && !syncing) {
        iAmSyncing = false;
        sync.idle();
      }
      if (iAmAnimationSyncing && !animationSyncing) {
        iAmAnimationSyncing = false;
        clearAnimation();
        animationSync.idle();
      }
      if (iAmAnimationSyncing && data.nextMove) {
        moveTo(data.nextMoveDuration, data.nextMoveLat,
          data.nextMoveLng, data.netMoveZ);
      }
    }
    // jscs:disable
    /**
    * This method will animate zoom and then move the map.
    * @method moveTo
    * @param duration {Integer} The maximum number of milliseconds for move.
    * @param lat {Number} The center latitute; -80 <= lat <= 80.
    * @param lng {Number} The center longitude.
    * @param z {Number} Optional zoom level.
    */
    // jscs:enable
    function moveTo(duration, lat, lng, z) {
      if (duration !== parseInt(duration)) {
        throw 400;
      }
      if (lat  === undefined ||
        typeof lat !== 'number' ||
        lat > MAX_LAT ||
        lat < MIN_LAT) {
        throw 400;
      }
      if (lng === undefined || typeof lng !== 'number') {
        throw 400;
      }
      if (z === undefined) {
        z = zoomLevel;
      }
      if (typeof z !== 'number') {
        throw 400;
      }
      var moveAnimationTime = 0;
      if (syncing) {
        if (iAmSyncing) {
          iAmSyncing = false;
          sync.idle();
        }
        syncing = false;
        oobSync.update();
        oobSync.idle();
      }
      if (animationSyncing) {
        if (iAmAnimationSyncing) {
          clearAnimation();
        } else {
          nextMove = true;
          nextMoveDuration = duration;
          nextMoveLat = lat;
          nextMoveLng = lng;
          nextMoveZ = z;
          oobSync.update();
          oobSync.idle();
          return;
        }
      }
      iAmAnimationSyncing = true;
      animationSyncing = true;
      oobSync.update();
      oobSync.idle();
      zoom(z);
      animationSync.update();
      moveAnimationInterval = window.setInterval(moveAnimation, INTERVAL);
      function moveAnimation() {
        moveAnimationTime += INTERVAL;
        // TODO: IMPLEMENT ANIMATION
        if (moveAnimationTime > duration) {
          window.clearInterval(moveAnimationInterval);
          moveAnimationInterval = null;
          // TODO: DO SOMETHING AT END
          centerLatLng = L.latLng(lat,lng);
          map.setView(
            centerLatLng,
            zoomLevel,
            {animate: false}
          );
          animationSync.update();
          animationSync.idle();
          iAmAnimationSyncing = false;
          animationSyncing = false;
          oobSync.update();
          oobSync.idle();
        } else {
          // TODO: DO SOMETHING DURING
          animationSync.update();
        }
      }
    }
    // jscs:disable
    /**
    * This method will stop active map animations.
    * @method moveStop
    */
    // jscs:enable
    function moveStop() {
      if (animationSyncing) {
        if (iAmAnimationSyncing) {
          iAmAnimationSyncing = false;
          clearAnimation();
          animationSync.idle();
        }
        animationSyncing = false;
        oobSync.update();
        oobSync.idle();
      }
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
      iAmSyncing = true;
      syncing = true;
      oobSync.update();
      oobSync.idle();
    }
    function handleMouseMove(e) {
      e.stopPropagation();
      if (iAmSyncing && mousePanning) {
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
      if (iAmSyncing && mousePanning) {
        mousePanning = false;
        sync.idle();
        iAmSyncing = false;
        syncing = false;
        oobSync.update();
        oobSync.idle();
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
        iAmSyncing = true;
        syncing = true;
        oobSync.update();
        oobSync.idle();
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
      if (iAmSyncing) {
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
    }
    function handleTouchEnd(e) {
      e.stopPropagation();
      if (zoomed) {
        return;
      }
      if (iAmSyncing) {
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
            iAmSyncing = false;
            syncing = false;
            oobSync.update();
            oobSync.idle();
          }
        }
        if (e.touches.length === 0) {
          sync.idle();
          iAmSyncing = false;
          syncing = false;
          oobSync.update();
          oobSync.idle();
        }
      }
    }
    function pan(shiftX, shiftY) {
      var lat = centerLatLng.lat;
      if (lat > MAX_LAT && shiftY < 0) {
        return;
      }
      if (lat < MIN_LAT && shiftY > 0) {
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
    function clearAnimation() {
      if (moveAnimationInterval) {
        window.clearInterval(moveAnimationInterval);
        moveAnimationInterval = null;
      }
    }
  }
})();
