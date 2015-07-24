/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

var globalHook = require('../../../backend/GlobalHook');
globalHook(window);
var React = require('react');

var websocketConnect = require('../../../backend/websocket-connect');

var Thing = React.createClass({
  getInitialState() {
    return {awesome: false};
  },
  render() {
    return <div>Things are {this.state.awesome ? 'awesome' : 'middling'}</div>
  }
});

var node = document.createElement('div');
document.body.appendChild(node);
React.render(<Thing/>, node);

window.onConnect = () => websocketConnect('ws://localhost:8097');
