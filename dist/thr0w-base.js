(function() {
  /**
  * This module provides the core functionality.
  * @module thr0w
  */
  'use strict';
  var baseref;
  var socket = null;
  var channel = null;
  var service = {};
  service.setBase = setBase;
  service.addAdminTools = addAdminTools;
  service.getChannel = getChannel;
  service.login = login;
  service.logout = logout;
  service.authenticated = authenticated;
  service.thr0w = thr0w;
  service.connect = connect;
  service.thr0wChannel = thr0wChannel;
  service.Grid = Grid;
  service.FlexGrid = FlexGrid;
  service.Sync = Sync;
  service.EventTarget = EventTarget;
  /**
  * This object provides the base functionality on the window object.
  * @class thr0w
  * @static
  */
  window.thr0w = service;
  /**
  * This function is used to set the base URI for the thr0w service.
  * @method setBase
  * @static
  * @param base {String} The URI. 
  */
  function setBase(base) {
    baseref = base;
  }
  /**
  * This function is used to add the administration tools (login, etc.).
  * @method addAdminTools
  * @static
  * @param base {Object} The frame DOM element.
  * @param connectCallback {Function} The callback function called when connected.
  * ```
  * function()
  * ```
  * @param messageCallback {Function} The callback function called for messages.
  * ```
  * function(data)
  *
  * Parameters:
  * 
  * data Object
  * The message data.
  * ```
  */
  function addAdminTools(frameEl, connectCallback, messageCallback) {
    if (frameEl === undefined || typeof frameEl !== 'object') {
      throw 400;
    }
    if (connectCallback === undefined || typeof connectCallback !== 'function') {
      throw 400;
    }
    if (messageCallback === undefined || typeof messageCallback !== 'function') {
      throw 400;
    }
    var loginEl = document.createElement('form');
    var connectEl = document.createElement('div');
    var connectConnectEl;
    loginEl.id = 'thr0w_base_login';
    loginEl.innerHTML = [
      '<input id="thr0w_base_login__username" type="text" placeholder="Username">',
      '<input id="thr0w_base_login__password" type="password" placeholder="Password">',
      '<button type="submit">Login</button>'
    ].join('');
    connectEl.id = 'thr0w_base_connect';
    connectEl.innerHTML = [
      '<form id="thr0w_base_connect__connect">',
      '<input id="thr0w_base_connect__connect__channel" type="number" />',
      '<button type="submit">Connect</button>',
      '</form>',
      '<button id="thr0w_base_connect__logout">Logout</button>'
    ].join('');
    frameEl.appendChild(loginEl);
    frameEl.appendChild(connectEl);
    connectConnectEl = connectEl.querySelector('#thr0w_base_connect__connect');
    if (authenticated()) {
      connectEl.style.display = 'block';
    } else {
      loginEl.style.display = 'block';
    }
    loginEl.addEventListener('submit', loginElSubmit);
    connectEl.querySelector('#thr0w_base_connect__logout').addEventListener('click', logout);
    connectConnectEl.addEventListener('submit', connectConnectElSubmit);
    function loginElSubmit(e) {
      e.preventDefault();
      var username = loginEl.querySelector('#thr0w_base_login__username').value;
      var password = loginEl.querySelector('#thr0w_base_login__password').value;
      if (username && password) {
        login(username, password, callback);
      }
      function callback(error) {
        if (!error) {
          loginEl.style.display = 'none';
          connectEl.style.display = 'block';
        }
      }
    }
    function connectConnectElSubmit(e) {
      e.preventDefault();
      var channel = parseInt(connectEl.querySelector('#thr0w_base_connect__connect__channel').value);
      if (!channel || channel < 0) {
        channel = 0;
      }
      connect(channel, callback, messageCallback);
      function callback(error) {
        if (!error) {
          connectEl.style.display = 'none';
          connectCallback();
        }
      }
    }
  }
  /**
  * This function returns the channel number.
  * @method getChannel
  * @static
  * @return {Integer} The channel number.
  */
  function getChannel() {
    return channel;
  }
  /**
  * This function logs in a user.
  * @method login
  * @static
  * @param username {String} The user's name.
  * @param password {String} The user's password.
  * @param callback {Function} The function callback.
  * ```
  * function(error)
  * 
  * Parameters:
  *
  * error Integer
  * The error code; null is success.
  * ```
  */
  function login(username, password, callback) {
    if (username === undefined || typeof username !== 'string') {
      throw 400; 
    }
    if (password === undefined || typeof password !== 'string') {
      throw 400; 
    }
    if (callback === undefined || typeof callback !== 'function') {
      throw 400;
    }
    var ref = baseref + ':3000/api/login';
    var params = 'username=' + username + '&password=' + password;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', ref, true);
    xmlhttp.setRequestHeader('Content-type',
      'application/x-www-form-urlencoded');
    xmlhttp.onreadystatechange = onChange;
    xmlhttp.send(params);
    function onChange() {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          var token;
          try {
            token = JSON.parse(xmlhttp.responseText).token;
          } catch (error) {
            return callback(500);
          }
          if (!token) {
            return callback(500);
          }
          window.localStorage.setItem('thr0w_token',
            token);
          return callback(null);
        } else {
          return callback(xmlhttp.status ? xmlhttp.status: 500);
        }
      }
    }
  }
  /**
  * This function logs out a user.
  * @method logout
  * @static
  */
  function logout() {
    window.localStorage.removeItem('thr0w_token');
    window.location.reload();
  }
  /**
  * This function returns if authenticated.
  * @method authenticated
  * @static
  * @return {Boolean} If authenticated.
  */
  function authenticated() {
    return window.localStorage.getItem('thr0w_token') !== null;
  }
  /**
  * This function is used send messages to channels.
  * @method thr0w
  * @static
  * @param channels {Array} Array of Integers; channel ids.
  * @param data {Object} The message data.
  */
  function thr0w(channels, data) {
    // RELYING ON SERVER FOR PARAMETER VALIDATION FOR PERFORMANCE
    var ref = baseref + ':3000/api/thr0w';
    var token = window.localStorage.getItem('thr0w_token');
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open('POST', ref, true);
    xmlhttp.setRequestHeader('Authorization',
      'bearer ' + token);
    xmlhttp.setRequestHeader('Content-type',
      'application/json');
    xmlhttp.send(JSON.stringify({channels: channels, message: data}));
  }
  /**
  * This function is used to connect to a channel.
  * @method connect
  * @static
  * @param chn {Integer} The channel id.
  * @param connectCallback {Function} The callback function called when connected.
  * ```
  * function()
  * ```
  * @param messageCallback {Function} The callback function called for messages.
  * ```
  * function(data)
  *
  * Parameters:
  * 
  * data Object
  * The message data.
  * ```
  */
  function connect(chn, connectCallback, messageCallback) {
    var token;
    var authTimeout;
    if (socket) {
      return;
    }
    if (!authenticated()) {
      throw 400;
    }
    if (chn === undefined || typeof chn !== 'number') {
      throw 400;
    }
    if (connectCallback === undefined || typeof connectCallback !== 'function') {
      throw 400;
    }
    if (messageCallback === undefined || typeof messageCallback !== 'function') {
      throw 400; 
    }
    channel = chn;
    token = window.localStorage.getItem('thr0w_token');
    authTimeout = window.setTimeout(fail, 5000);
    socket = window.io(baseref + ':3001');
    socket.on('authenticated', success);
    socket.emit('authenticate',
      JSON.stringify({token: token, channel: channel})
    );
    function fail() {
      socket.disconnect();
      connectCallback(500);
    }
    function success() {
      window.clearTimeout(authTimeout);
      socket.on('message', messageCallback);
      socket.on('duplicate', duplicateCallback);
      connectCallback(null);
      function duplicateCallback() {
        window.location.reload();
      }
    }
  }
  /**
  * This function is used to send messages via the channel.
  * @method thr0wChannel
  * @static
  * @param channels {Array} Array of Integers; channel ids.
  * @param data {Object} The message data.
  */
  function thr0wChannel(channels, data) {
    // RELYING ON SERVER FOR PARAMETER VALIDATION FOR PERFORMANCE
    if (!socket) {
      throw 400;
    }
    socket.emit('thr0w', JSON.stringify({channels: channels, message: data}));
  }
  /**
  * This class is used to create grids.
  * @namespace thr0w
  * @class Grid
  * @constructor
  * @param {Object} frameEl The frame DOM element.
  * @param {Object} contentEl The content DOM element.
  * @param {Array} matrix An array of arrays of integers defining the channels for the grid.
  */
  function Grid(frameEl, contentEl, matrix) {
    if (!socket) {
      throw 400;
    }
    if (frameEl === undefined || typeof frameEl !== 'object') {
      throw 400;
    }
    if (contentEl === undefined || typeof contentEl !== 'object') {
      throw 400;
    }
    if (matrix === undefined || !Array.isArray(matrix)) {
      throw 400;
    }
    var hpos;
    var vpos;
    for (var i = 0; i < matrix.length; i++) {
      for (var j = 0; j < matrix[i].length; j++) {
        if (channel === matrix[i][j]) {
          hpos = j;
          vpos = i;
        }
      }
    }
    contentEl.style.left = '-' + hpos * frameEl.clientWidth + 'px';
    contentEl.style.top = '-' + vpos * frameEl.clientHeight + 'px';
    this.getFrame = getFrame;
    this.getContent = getContent;
    this.getMatrix = getMatrix;
    this.getWidth = getWidth;
    this.getHeight = getHeight;
    /**
    * This function returns the grid's frame.
    * @method getFrame
    * @return {Object} The grid's frame DOM object.
    */
    function getFrame() {
      return frameEl;
    }
    /**
    * This function returns the grid's content.
    * @method getContent
    * @return {Object} The grid's content DOM object.
    */
    function getContent() {
      return contentEl;
    }
    /**
    * This function returns the grid's matrix.
    * @method getMatrix
    * @return {Array} An array of arrays of integers defining the channels for the grid.
    */
    function getMatrix() {
      return matrix;
    }
    /**
    * This function returns the grid's width.
    * @method getWidth
    * @return {Integer} The width of the grid.
    */
    function getWidth() {
      return contentEl.offsetWidth; 
    }
    /**
    * This function returns the grid's height.
    * @method getHeight
    * @return {Integer} The height of the grid.
    */
    function getHeight() {
      return contentEl.offsetHeight; 
    }
  }
  /**
  * This class is used to create flexible grids.
  * @namespace thr0w
  * @class FlexGrid
  * @constructor
  * @param {Object} frameEl The frame DOM element.
  * @param {Object} contentEl The content DOM element.
  * @param {Array} matrix An array of arrays of integers defining the channels for the grid.
  * @param {Array} dimensions An array of objects consisting of width and height (and optional scale) of the frames in each row. 
  */
  function FlexGrid(frameEl, contentEl, matrix, dimensions) {
    if (!socket) {
      throw 400;
    }
    if (frameEl === undefined || typeof frameEl !== 'object') {
      throw 400;
    }
    if (contentEl === undefined || typeof contentEl !== 'object') {
      throw 400;
    }
    if (matrix === undefined || !Array.isArray(matrix)) {
      throw 400;
    }
    if (dimensions === undefined || !Array.isArray(dimensions)) {
      throw 400;
    }
    var i;
    var j;
    var hpos;
    var vpos;
    var width = 0;
    var height = 0;
    var shiftLeft = 0;
    var shiftTop = 0;
    for (i = 0; i < matrix.length; i++) {
      dimensions[i].scale = dimensions[i].scale ? dimensions[i].scale : 1;
      width = Math.max(dimensions[i].scale * dimensions[i].width * matrix[i].length, width);
      height += dimensions[i].scale * dimensions[i].height;
      for (j = 0; j < matrix[i].length; j++) {
        if (channel === matrix[i][j]) {
          hpos = j;
          vpos = i;
        }
      }
    }
    frameEl.style.width = (dimensions[vpos].scale * dimensions[vpos].width) + 'px';
    frameEl.style.height = (dimensions[vpos].scale * dimensions[vpos].height) + 'px';
    frameEl.style.transform = 'scale(' + (1 / dimensions[vpos].scale) + ', ' + (1 / dimensions[vpos].scale) + ')';
    contentEl.style.width = width + 'px';
    contentEl.style.height = height + 'px';
    for (i = 0; i < vpos; i++) {
      shiftTop += dimensions[i].scale * dimensions[i].height;
    }
    shiftLeft = hpos * dimensions[vpos].scale * dimensions[vpos].width + hpos * (width - matrix[vpos].length * dimensions[vpos].scale * dimensions[vpos].width) / (matrix[vpos].length - 1);
    contentEl.style.left = '-' + shiftLeft + 'px';
    contentEl.style.top = '-' + shiftTop + 'px';
    this.getFrame = getFrame;
    this.getContent = getContent;
    this.getMatrix = getMatrix;
    this.getWidth = getWidth;
    this.getHeight = getHeight;
    /**
    * This function returns the grid's frame.
    * @method getFrame
    * @return {Object} The grid's frame DOM object.
    */
    function getFrame() {
      return frameEl;
    }
    /**
    * This function returns the grid's content.
    * @method getContent
    * @return {Object} The grid's content DOM object.
    */
    function getContent() {
      return contentEl;
    }
    /**
    * This function returns the grid's matrix.
    * @method getMatrix
    * @return {Array} An array of arrays of integers defining the channels for the grid.
    */
    function getMatrix() {
      return matrix;
    }
    /**
    * This function returns the grid's width.
    * @method getWidth
    * @return {Integer} The width of the grid.
    */
    function getWidth() {
      return width;
    }
    /**
    * This function returns the grid's height.
    * @method getHeight
    * @return {Integer} The height of the grid.
    */
    function getHeight() {
      return height;
    }
  }
  /**
  * This class is used to create syncs.
  * @namespace thr0w
  * @class Sync
  * @constructor
  * @param {Object} grid The grid, {{#crossLink "thr0w.Grid"}}thr0w.Grid{{/crossLink}} or {{#crossLink "thr0w.FlexGrid"}}thr0w.FlexGrid{{/crossLink}} object.
  * @param {String} _id The identifier for the sync.
  * @param {Function} message The function that generates the message.
  * ```
  * function()
  *
  * Returns: 
  * Object 
  * The message data.
  * ```
  * @param {Function} receive The function that handles received messages.
  * ```
  * function(data)
  *
  * Parameters:
  *
  * data Object
  * The message data.
  * ```
  */
  function Sync(grid, _id, message, receive) {
    if (grid === undefined || typeof grid !== 'object') {
      throw 400;
    }
    if (_id === undefined || typeof _id !== 'string') {
      throw 400;
    } 
    if (message === undefined || typeof message !== 'function') {
      throw 400;
    }
    if (receive === undefined || typeof receive !== 'function') {
      throw 400;
    }
    var channels = [];
    var hpos;
    var vpos;
    var active = false;
    var locked = false;
    var lastActive = false;
    var matrix = grid.getMatrix();
    for (var i = 0; i < matrix.length; i++) {
      for (var j = 0; j < matrix[i].length; j++) {
        channels.push(matrix[i][j]);
        if (channel === matrix[i][j]) {
          hpos = j;
          vpos = i;
        }
      }
    }
    socket.on('message', syncMessageCallback);
    thr0wChannel(channels, {thr0w: {type: 'sync', _id: _id, hello: true}});
    this.update = update;
    this.idle = idle;
    this.destroy = destroy;
    /**
    * This function is used to trigger an update message.
    * @method update
    */
    function update() {
      if (locked) {
        return;
      }
      if (!active) {
        active = true;
        lastActive = true;
        thr0wChannel(channels, {thr0w: {type: 'sync', _id: _id, lock: true}});
      }
      thr0wChannel(channels, {thr0w: {type: 'sync', _id: _id, message: message()}});
    }
    /**
    * This function is used to release control to other channels.
    * @method idle
    */
    function idle() {
      if (locked) {
        return;
      }
      active = false;
      thr0wChannel(channels, {thr0w: {type: 'sync', _id: _id, unlock: true}});
    }
    function syncMessageCallback(rawMsg) {
      var msg = rawMsg.message;
      if (msg === undefined || rawMsg.source === channel) {
        return;
      }       
      var thr0wMsg = msg.thr0w;
      if (thr0wMsg === undefined || thr0wMsg.type !== 'sync' || thr0wMsg._id !== _id) {
        return;
      }
      if (thr0wMsg.hello) {
        if (active) {
          thr0wChannel(channels, {thr0w: {type: 'sync', _id: _id, lock: true}});
        }
        if (lastActive) {
          thr0wChannel(channels, {thr0w: {type: 'sync', _id: _id, message: message()}});
        }
        return;
      }
      if (active) {
        return;
      }
      if (thr0wMsg.lock && !active) {
        lastActive = false;
        locked = true;
        return;
      }
      if (thr0wMsg.unlock && !active) {
        locked = false;
        return;
      }
      receive(thr0wMsg.message);
    }
    function destroy() {
      socket.off('message', syncMessageCallback);
    }
  }
  // Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
  // MIT License
  function EventTarget(){
    this._listeners = {};
  }
  EventTarget.prototype = {
//    constructor: EventTarget,
    addListener: function(type, listener){
      if (typeof this._listeners[type] === "undefined"){
        this._listeners[type] = [];
      }
      this._listeners[type].push(listener);
    },
    fire: function(event){
      if (typeof event === "string"){
        event = { type: event };
      }
      if (!event.target){
        event.target = this;
      }
      if (!event.type){  //falsy
        throw new Error("Event object missing 'type' property.");
      }
      if (this._listeners[event.type] instanceof Array) {
        var listeners = this._listeners[event.type];
        for (var i=0, len=listeners.length; i < len; i++) {
          listeners[i].call(this, event);
        }
      }
    },
    removeListener: function(type, listener) {
      if (this._listeners[type] instanceof Array) {
        var listeners = this._listeners[type];
        for (var i=0, len=listeners.length; i < len; i++) {
          if (listeners[i] === listener) {
            listeners.splice(i, 1);
            break;
          }
        }
      }
    }
  };
})();
