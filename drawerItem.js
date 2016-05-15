/**
 * Item for DrawerLayoutAndroid
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
  TouchableHighlight,
  View,
  Text
} from 'react-native';

import Icon from 'react-native-vector-icons/Octicons';

class DrawerItem extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    return (
      <TouchableHighlight
        onPress={this.props.onPress}>
        <View style={styles.drawer_menu}>
          <Icon name={this.props.iconName} style={styles.drawer_item_icon} />
          <Text style={styles.drawer_item}>{this.props.text}</Text>
        </View>
      </TouchableHighlight>
    );
  }
}

var styles = StyleSheet.create({
  drawer_menu: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#999",
  },
  drawer_item_icon: {
    color: "black",
    fontSize: 20,
    width: 25,
  },
  drawer_item: {
    color: "black",
    fontSize: 15,
    marginLeft: 5,
  }
});

AppRegistry.registerComponent('DrawerItem', () => DrawerItem);

module.exports = DrawerItem;
