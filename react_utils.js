/*
 * react_utils.js
 * Copyright (C) 2015 diskshima <diskshima@diskshima-MBP.local>
 *
 * Distributed under terms of the MIT license.
 */

'use strict';

var React = require('react-native');

var {
  ToastAndroid,
} = React;

var ReactUtils = {
  showToast: function (msg: string) {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  },
};

module.exports = ReactUtils;
