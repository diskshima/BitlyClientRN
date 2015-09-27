/*
 * login.js
 * Copyright (C) 2015 diskshima <diskshima@diskshima-MBP.local>
 *
 * Distributed under terms of the MIT license.
 */

'use strict';

var React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight,
} = React;

var Button = require('./button');

var ReactUtils = require('./react_utils.js');

var Login = React.createClass({
  getInitialState: function () {
    return {
      username: "",
      password: "",
    }
  },
  render: function() {
    return (
      <View style={styles.login}>
        <Text>Login ID</Text>
        <TextInput
          style={styles.text_input}
          onChangeText={(text) => this.setState({ username: text })}
          value={this.state.username}
        />
        <Text>Password</Text>
        <TextInput
          style={styles.text_input}
          secureTextEntry={true}
          onChangeText={(text) => this.setState({ password: text })}
          value={this.state.password}
        />
        <Button onPress={this._onLoginClicked} text="Login" />
      </View>
    );
  },
  _onLoginClicked: function () {
    var username = this.state.username;
    var password = this.state.password;
    ReactUtils.showToast("Logging in " + username);
    var bitly = this.props.bitly;
    var callback = this.props.callback;

    bitly.authenticate(username, password, (response) => {
      callback(response);
    });
  },
});

var styles = StyleSheet.create({
  login: {
    flex: 1,
  },
  text_input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
});

AppRegistry.registerComponent('Login', () => Login);

module.exports = Login
