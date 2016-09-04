/**
 * MainView.js - App's main view
 */

import React, { Component } from 'react';
import { View, DrawerLayoutAndroid, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/Octicons';

import DrawerItem from './drawerItem';
import LinkListView from './LinkListView';

export default class MainView extends Component {
  constructor(props) {
    super(props);
    this.state = {showOnlyArchived: props.showOnlyArchived,
      refreshing: props.refreshing, dataSource: props.dataSource}

    this._onRefresh = props.onRefresh.bind(this);
    this._onPressRow = props.onPressRow.bind(this);
    this._onLongPressRow = props.onLongPressRow.bind(this);
    this._onEndReached = props.onEndReached.bind(this);

    this._onShortenClicked = props.onShortenClicked.bind(this);
    this._onArchiveToggle = props.onArchiveToggle.bind(this);
    this._onLogoutClicked = props.onLogoutClicked.bind(this);
  }

  render() {
    var archiveMenu = this.state.showOnlyArchived ? "Show Links" : "Show Archived";

    var drawerView = (
      <View>
        <DrawerItem
          onPress={() => this._onShortenClicked()}
          iconName="plus"
          text="Shorten New" />
        <DrawerItem
          onPress={() => this._onArchiveToggle()}
          iconName="package"
          text={archiveMenu} />
        <DrawerItem
          onPress={() => this._onLogoutClicked()}
          iconName="sign-out"
          text="Logout" />
      </View>
    );

    return (
      <DrawerLayoutAndroid
        drawerWidth={200}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        ref={'DRAWER'}
        renderNavigationView={() => drawerView}>
        <View style={styles.main}>
          <View style={styles.topmenu}>
            <Icon name="three-bars" size={35} color="black"
              onPress={() => this._openDrawer()} />
          </View>
          <LinkListView
            refreshing={this.state.refreshing}
            dataSource={this.state.dataSource}
            onRefresh={() => this._onRefresh()}
            onPressRow={(entry) => this._onPressRow(entry)}
            onLongPressRow={(entry) => this._onLongPressRow(entry)}
            onEndReached={() => this._onEndReached()}
          />
        </View>
      </DrawerLayoutAndroid>
    );
  }

  _openDrawer() {
    this.refs['DRAWER'].openDrawer();
  }
}

var styles = StyleSheet.create({
  topmenu: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    height: 50,
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
});
