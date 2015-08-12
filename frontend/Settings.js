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

type Props = {
  settings: Object,
};

class Settings extends React.Component {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = {
      ...props.settings,
    };
  }

  render(): ReactElement {
    return (
      <div style={styles.container}>
        Put your settings here!
        <br/>
      </div>
    );
  }
}

var styles = {
  container: {
    flex: 1,
    textAlign: 'center',
    padding: 50,
  },
};
module.exports = Settings;
