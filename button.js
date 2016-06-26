/*
 * button.js
 * Copyright (C) 2015 diskshima <diskshima@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */

'use strict';

var React = require('react');
var ReactNative = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableHighlight,
} = ReactNative;

var Button = React.createClass({
  render: function () {
    return (
      <TouchableHighlight
        style={[this.props.style, styles.button]}
        onPress={this.props.onPress}>
        <Text style={styles.text}>{this.props.text}</Text>
      </TouchableHighlight>
    );
  },
});

var styles = StyleSheet.create({
  button: {
    backgroundColor: "#E2F5FD",
    width: 100,
    marginBottom: 5,
  },
  text: {
    color: "#EA4A0E",
    textAlign: "center",
    alignItems: "stretch",
    fontSize: 18,
  },
});

AppRegistry.registerComponent('Button', () => Button);

module.exports = Button;
