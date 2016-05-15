 /**
  * View for adding links.
  *
  * Author: Daisuke Shimamoto <diskshima@gmail.com>
  */
'use strict';

import React, {
  Component,
} from 'react';

import {
  AppRegistry,
  StyleSheet,
  View,
  Text,
  TextInput,
  Picker
} from 'react-native';

import Icon from 'react-native-vector-icons/Octicons';

import ReactUtils from './react_utils';
import Button from './button';

class AddView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: this.props.url,
      domain: this.props.domain || 'bit.ly',
    };
  }

  componentDidMount() {
  }

  onAdd() {
    var url = this.state.url;

    if (url === undefined) {
      ReactUtils.showToast("Please enter a URL.");
      return;
    }

    this.props.onAddPressed(url, this.state.domain);
  }

  render() {
    return (
      <View>
        <Text>New URL to shorten</Text>
        <TextInput
          onChangeText={(text) => this.setState({ url: text })}
          value={this.state.url}
        />
        <Picker
          selectedValue={this.state.domain}
          onValueChange={(newDomain) => this.setState({ domain: newDomain })}>
          <Picker.Item label="bit.ly" value="bit.ly" />
          <Picker.Item label="bitly.com" value="bitly.com" />
          <Picker.Item label="j.mp" value="j.mp" />
        </Picker>
        <Icon.Button name="plus" onPress={() => this.onAdd()}>
          <Text>Add New Link</Text>
        </Icon.Button>
      </View>
    );
  }
}

var styles = StyleSheet.create({
  top_buttons: {
    flexDirection: "row",
  },
  add_button: {
    margin: 5,
  }
});

AppRegistry.registerComponent('AddView', () => AddView);

module.exports = AddView;
