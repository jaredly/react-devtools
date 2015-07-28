/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

var ContextMenu = require('./ContextMenu');
var PropState = require('./PropState');
var React = require('react');
var SearchPane = require('./SearchPane');
var SplitPane = require('./SplitPane');
var Settings = require('./Settings');
var TabbedPane = require('./TabbedPane');

var decorate = require('./decorate');

import type MenuItem from './ContextMenu';

var DEFAULT_SETTINGS = {
  debugPort: 8097,
};

class Container extends React.Component {
  props: {
    startInspecting: () => void,
    reload: () => void,
    win: Object,
    extraPanes: Array<(node: Object) => ReactElement>,
    menuItems: {
      tree?: (id: string, node: Object, store: Object) => ?Array<MenuItem>,
      attr?: (
        id: string,
        node: Object,
        val: any,
        path: Array<string>,
        name: string,
        store: Object
      ) => ?Array<MenuItem>,
    },
  };

  constructor(props: Object) {
    super(props);
    var settings = DEFAULT_SETTINGS;
    /*
    try {
      var raw = localStorage.getItem('reactDevtoolsSettings');
      if (raw) {
        settings = JSON.parse(raw);
      }
    } catch (e) {
    }
    */
    this.state = {
      showSettings: false,
      settings,
    };
  }

  render(): ReactElement {
    var tabs = {
      Settings: () => (
        <Settings settings={this.state.settings} onClose={() => this.setState({showSettings: false})} />
      ),
      Elements: () => (
        <SplitPane
          initialWidth={300}
          win={this.props.win}
          left={() => <SearchPane win={this.props.win} reload={this.props.reload} />}
          right={() => (
            <div>
              <button onClick={() => this.props.startInspecting()}>Inspect</button>
              <button onClick={() => this.setState({showSettings: true})}>Settings</button>
              <PropState extraPanes={this.props.extraPanes} />
            </div>
          )}
        />
      ),
    };
    if (this.props.extraTabs) {
      for (var name in this.props.extraTabs) {
        tabs[name] = this.props.extraTabs[name];
      }
    }
    return (
      <div style={styles.container}>
        <TabbedPane
          tabs={tabs}
        />
        <ContextMenu itemSources={[DEFAULT_ITEMS, this.props.menuItems]} />
      </div>
    );
    /*
    if (this.state.showSettings) {
    }
    return (
    );
    */
  }
}

var DEFAULT_ITEMS = {
  tree: (id, node, store) => {
    var items = [];
    if (node.get('name')) {
      items.push({
        title: 'Show all ' + node.get('name'),
        action: () => store.changeSearch(node.get('name')),
      });
    }
    if (store.capabilities.scroll) {
      items.push({
        title: 'Scroll to Node',
        action: () => store.scrollToNode(id),
      });
    }
    return items;
  },
  attr: (id, node, val, path, name, store) => {
    var items = [{
      title: 'Store as global variable',
      action: () => store.makeGlobal(id, path),
    }];
    return items;
  },
};

var styles = {
  container: {
    flex: 1,
    display: 'flex',
    minWidth: 0,
  },
};

module.exports = Container;
