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

module.exports = {
  debug: true,
  devtool: 'source-map',
  entry: './index.js',
  output: {
    path: __dirname + '/build', // eslint-disable-line no-path-concat
    filename: 'embed.js',
  },

  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader:  'babel-loader',
      exclude: [
        'node_modules',
      ],
    }]
  },
};

