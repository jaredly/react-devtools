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

var React = require('react');
var assign = require('object-assign');
var decorate = require('./decorate');

class TabbedPane {
  props: {
    tabs: {[key: string]: () => ReactElement},
    selected: string,
    setSelectedTab: (name: string) => void,
    onInspectToggle: () => void,
    onSettings: () => void,
  };

  render() {
    var tabs = Object.keys(this.props.tabs);
    var inspectStyle = styles.icon;
    if (this.props.inspecting) {
      inspectStyle = assign({}, styles.icon, styles.inspectingIcon);
    }
    var settingsTab = styles.pin;
    if (this.props.selected === 'Settings') {
      settingsTab = assign({}, styles.pin, styles.selectedTab, styles.selectedPin);
    }
    return (
      <div style={styles.container}>
        <ul style={styles.tabs}>
          <li onClick={this.props.onInspectToggle} style={styles.pin}>
            <i className="material-icons" style={inspectStyle}>search</i>
          </li>
          <li onClick={() => this.props.setSelectedTab('Settings')} style={settingsTab}>
            <i className="material-icons" style={styles.icon}>settings</i>
          </li>
          {tabs.map((name, i) => {
            if (name === 'Settings') {
              return;
            }
            var style = styles.tab;
            if (name === this.props.selected) {
              style = assign({}, style, styles.selectedTab);
            }
            if (i === tabs.length - 1) {
              style = assign({}, style, styles.lastTab);
            }
            return (
              <li style={style} onClick={() => this.props.setSelectedTab(name)}>
                {name}
              </li>
            );
          })}
        </ul>
        <div style={styles.body}>
          {this.props.tabs[this.props.selected]()}
        </div>
      </div>
    );
  }
}

var styles = {
  container:{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  tabs: {
    display: 'flex',
    flexShrink: 0,
    listStyle: 'none',
    backgroundColor: '#eee',
    borderBottom: '1px solid rgb(163, 163, 163)',
    margin: 0,
    padding: '0 2px',
  },
  tab: {
    padding: '2px 4px',
    lineHeight: '15px',
    fontSize: 12,
    fontFamily: "'Lucida Grande', sans-serif",
    cursor: 'pointer',
    borderLeft: '1px solid rgb(163, 163, 163)',
  },
  lastTab: {
    borderRight: '1px solid rgb(163, 163, 163)',
  },
  selectedTab: {
    backgroundColor: 'white',
  },
  body: {
    flex: 1,
    display: 'flex',
    minHeight: 0,
  },
  pin: {
    padding: '0 5px',
    cursor: 'pointer',
    borderLeft: '1px solid transparent',
  },
  icon: {
    fontSize: 18,
    position: 'relative',
    top: 2,
  },
  inspectingIcon: {
    color: 'blue',
  },
  selectedPin: {
    borderLeft: '1px solid rgb(163, 163, 163)',
  },
};

module.exports = decorate({
  listeners: () => ['selectedTab', 'inspecting'],
  props(store) {
    return {
      selected: store.selectedTab,
      setSelectedTab: name => store.setSelectedTab(name),
      inspecting: store.inspecting,
      onInspectToggle: () => store.toggleInspection(),
    }
  },
}, TabbedPane);
