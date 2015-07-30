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

require('es6-map/implement');
require('es6-set/implement');

//var test = require('tape');
//var makeReporter = require('./reporter');
var spy = require('./spy');

var attachRenderer = require('../attachRenderer');
var globalHook = require('../GlobalHook.js');
globalHook(window);

if (!window.IS_TRAVIS) {
  //makeReporter(test.createStream({objectMode: true}));
}

var React = require('./v0.14/node_modules/react');
var {EventEmitter} = require('events');

var renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__._renderers;
var renderer = renderers[Object.keys(renderers)[0]];

function tracker(hook) {
  var els = new Map();
  var roots = new Set();
  hook.on('root', ({element}) => roots.add(element));
  hook.on('unmount', ({element}) => {
    roots.delete(element);
    els.delete(element);
  });
  hook.on('mount', ({element, data}) => {
    els.set(element, [data]);
  });
  hook.on('update', ({element, data}) => {
    els.get(element).push(data);
  });
  return {els, roots};
}

function setup(hook) {
  var handlers = {
    root: spy(),
    mount: spy(),
    update: spy(),
    unmount: spy(),
  };
  for (var name in handlers) {
    hook.on(name, handlers[name]);
  }
  return handlers;
}

function wrapElement(hook, element) {
  var extras = attachRenderer(hook, 'abc', renderer);
  var node = document.createElement('div');
  React.render(element, node);
  extras.cleanup();
  React.unmountComponentAtNode(node);
}

function wrapRender(hook, fn) {
  var extras = attachRenderer(hook, 'abc', renderer);
  fn();
  extras.cleanup();
}

var SimpleApp = React.createClass({
  render() {
    return <div>Hello</div>;
  },
});

// Mounting and Unmounting

it('should work with plain DOM node', t => {
  var hook = new EventEmitter();
  var handlers = setup(hook);

  wrapElement(hook, <div>Plain</div>);

  expect(handlers.root.calledOnce).toBeTruthy('One root');
  // the root-level wrapper, and the div
  expect(handlers.mount.callCount).toEqual(2, 'Two mounts');
  expect(handlers.unmount.called).not.toBeTruthy('No unmounts');
});

it('should work with simple composite component', t => {
  var hook = new EventEmitter();
  var handlers = setup(hook);

  wrapElement(hook, <SimpleApp/>);

  expect(handlers.root.calledOnce).toBeTruthy('One root');
  // the root-level wrapper, the composite component, and the div
  expect(handlers.mount.callCount).toEqual(3, 'Three mounts');
  expect(handlers.unmount.called).not.toBeTruthy('No unmounts');
});

it('attaching late should work', t => {
  var hook = new EventEmitter();
  var handlers = setup(hook);

  var node = document.createElement('div');
  React.render(<SimpleApp/>, node);

  var extras = attachRenderer(hook, 'abc', renderer);
  extras.walkTree((component, data) => handlers.mount({component, data}), component => handlers.root({component}));

  expect(handlers.root.callCount).toEqual(1, 'One root');
  // the root-level wrapper, the composite component, and the div
  expect(handlers.mount.callCount).toEqual(3, 'Three mounts');
  expect(handlers.unmount.called).not.toBeTruthy('No unmounts');

  // cleanup after
  extras.cleanup();
  React.unmountComponentAtNode(node);

});

it('should unmount everything', t => {
  var hook = new EventEmitter();
  var els = new Set();
  hook.on('mount', ({element}) => els.add(element));
  hook.on('unmount', ({element}) => els.delete(element));

  wrapRender(hook, () => {
    var node = document.createElement('div');
    React.render(<SimpleApp/>, node);
    expect(els.size > 0).toBeTruthy('Some elements');
    React.unmountComponentAtNode(node);
  });

  expect(els.size).toEqual(0, 'Everything unmounted');
});

it('should register two roots', t => {
  var hook = new EventEmitter();
  var handlers = setup(hook);

  wrapRender(hook, () => {
    var node = document.createElement('div');
    var node2 = document.createElement('div');
    React.render(<SimpleApp/>, node);
    React.render(<SimpleApp/>, node2);
    React.unmountComponentAtNode(node);
    React.unmountComponentAtNode(node2);
  });

  expect(handlers.root.callCount).toEqual(2, 'Two roots');
});

it('Double render', t => {
  var hook = new EventEmitter();
  var handlers = setup(hook);
  var els = new Set();
  hook.on('mount', ({element}) => els.add(element));
  hook.on('unmount', ({element}) => els.delete(element));

  wrapNode(node => {
    wrapRender(hook, () => {
      React.render(<SimpleApp/>, node);
      expect(handlers.update.callCount).toEqual(0, 'No updates');
      React.render(<SimpleApp/>, node);
    });
  });

  expect(handlers.root.callCount).toEqual(1, 'One root');
  expect(handlers.update.callCount > 0).toBeTruthy('Updates');
  expect(els.size).toEqual(3, 'Only three mounted');
});

it('Plain text nodes', t => {
  var hook = new EventEmitter();
  var {roots, els} = tracker(hook);

  var PlainApp = React.createClass({
    render() {
      return <div>one{['two']}three</div>;
    },
  });
  wrapElement(hook, <PlainApp/>);

  var root = roots.values().next().value;
  var composite = els.get(root)[0].children[0];
  var div = els.get(composite)[0].children[0];
  var texts = els.get(div)[0].children;

  var contents = ['one', 'two', 'three'];

  expect(texts.length).toEqual(3, '3 text children');

  texts.forEach((comp, i) => {
    expect(els.get(comp)[0].text).toEqual(contents[i], i + ') Text content correct');
    expect(els.get(comp)[0].nodeType).toEqual('Text', i + ') NodeType = text');
  });

});

// State updating

var StateApp = React.createClass({
  getInitialState() {
    return {updated: false};
  },
  render() {
    return <div>{this.state.updated ? 'Updated' : 'Not updated'}</div>;
  },
});

function wrapNode(fn) {
  var node = document.createElement('div');
  fn(node);
  React.unmountComponentAtNode(node);
}

it('State update', t => {
  var hook = new EventEmitter();
  var {roots, els} = tracker(hook);

  wrapNode(node => {
    wrapRender(hook, () => {
      var App = React.render(<StateApp/>, node);
      App.setState({updated: true});
    });
  });

  var root = roots.values().next().value;
  var composite = els.get(root)[0].children[0];
  var div = els.get(composite)[0].children[0];

  var divUpdates = els.get(div);
  expect(divUpdates[0].nodeType).toEqual('Native', '[Div] Native type');
  expect(divUpdates[0].name).toEqual('div', 'Named "div"');
  expect(divUpdates[0].children).toEqual('Not updated', 'At first, not updated');
  expect(divUpdates[1].children).toEqual('Updated', 'Then, updated');
  var updates = els.get(composite);
  expect(updates[0].nodeType).toEqual('Composite', '[App] Composite type');
  expect(updates[0].name).toEqual('StateApp', 'Named "StateApp"');
  expect(updates[0].state.updated).toEqual(false, 'State[0] updated=false');
  expect(updates[1].state.updated).toEqual(true, 'State[1] updated=true');
});

it('Props update', t => {
  var hook = new EventEmitter();
  var {roots, els} = tracker(hook);

  var StateProps = React.createClass({
    getInitialState() {
      return {pass: false};
    },
    render() {
      return <SimpleApp pass={this.state.pass}/>;
    },
  });

  wrapNode(node => {
    wrapRender(hook, () => {
      var App = React.render(<StateProps/>, node);
      App.setState({pass: true});
      App.setState({pass: 100});
    });
  });

  var root = roots.values().next().value;
  var composite = els.get(root)[0].children[0];
  var simple = els.get(composite)[0].children[0];

  var updates = els.get(simple);
  expect(updates[0].props.pass).toEqual(false, 't=0, prop=false');
  expect(updates[1].props.pass).toEqual(true, 't=1, prop=true');
  expect(updates[2].props.pass).toEqual(100, 't=2, prop=100');
});
