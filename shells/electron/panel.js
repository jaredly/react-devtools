/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */
'use strict';

var chalk = require('chalk');
chalk.enabled = true;
var ip = require('ip');
var ws = require('ws');
var fs = require('fs');
var path = require('path');

var globalHook = require('../../backend/GlobalHook');
globalHook(window);

var Panel = require('../../frontend/Panel');
var React = require('react');

var node = document.getElementById('container');
var wall = null;

var config = {
  reload,
  alreadyFoundReact: true,
  inject(done) {
    done(wall);
  },
};

function reload() {
  React.unmountComponentAtNode(node);
  node.innerHTML = '';
  setTimeout(() => {
    React.render(<Panel {...config} />, node);
  }, 100);
}

function onDisconnected() {
  React.unmountComponentAtNode(node);
  node.innerHTML = '<h2 id="waiting">Waiting for a connection from React Native</h2>';
};

function initialize(socket) {
  fs.readFile(path.join(__dirname, '/build/backend.js'), function (err, backendScript) {
    if (err) {
      return console.error('failed to load...', err);
    }
    socket.send('eval:' + backendScript.toString('utf8'));
    var listeners = [];
    socket.onmessage = function (evt) {
      var data = JSON.parse(evt.data);
      if (data.$close || data.$error) {
        console.log('Closing or Erroring');
        onDisconnected();
        socket.onmessage = evt => {
          if (evt.data === 'attach:agent') {
            initialize(socket);
          }
        };
        return;
      }
      if (data.$open) {
        return; // ignore
      }
      listeners.forEach(function (fn) {fn(data); });
    };

    wall = {
      listen(fn) {
        listeners.push(fn);
      },
      send(data) {
        socket.send(JSON.stringify(data));
      },
      disconnect() {
        socket.close();
      },
    };

    console.log('connected');
    reload();
  });
}

/**
 * This is the normal mode, where it connects to the react native packager
 */
function connectToPackager() {
  console.log('trying to connect');
  var socket = ws.connect('ws://localhost:8081/debugger-proxy');
  socket.onmessage = evt => {
    if (evt.data === 'attach:agent') {
      initialize(socket);
    }
  };
  socket.onerror = function (err) {
    onDisconnected();
    console.log('Error with websocket connection', err);
  };
  socket.onclose = function () {
    onDisconnected();
    console.log('Connection to RN closed');
  };
}

/**
 * When the Electron app is running in "server mode"
 */
function startServer() {
  console.log('waiting for a connection');
  var httpServer = require('http').createServer()
  var server = new ws.Server({server: httpServer})
  var connected = false;
  server.on('connection', function (socket) {
    if (connected) {
      console.warn('only one connection allowed at a time');
      socket.close();
      return;
    }
    connected = true;
    socket.onerror = function (err) {
      connected = false;
      onDisconnected();
      console.log('Error with websocket connection', err);
    };
    socket.onclose = function () {
      connected = false;
      onDisconnected();
      console.log('Connection to RN closed');
    };
    initialize(socket);
  });

  var embedFile = require('fs').readFileSync(__dirname + '/embed/build/embed.js');
  httpServer.on('request', (req, res) => {
    res.end(embedFile);
  });
  httpServer.listen(8097, () => {
    console.log(chalk.red(`
--------------
React Devtools
--------------`) + `

listening on port 8097.
Add ${chalk.yellow('<script src="http://localhost:8097"></script>')}
or ${chalk.yellow('<script src="http://' + ip.address() + ':8097"></script>')}
to the top of the page you want to debug.

`)
  });
};

window.connectToPackager = connectToPackager;
window.startServer = startServer;
