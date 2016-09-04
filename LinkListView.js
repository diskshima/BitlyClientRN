/**
 * LinkListView.js - View for links.
 */

import React, { Component } from 'react';
import { View, Text, ListView,
  RefreshControl, TouchableHighlight, StyleSheet } from 'react-native';

export default class LinkListView extends Component {
  constructor(props) {
    super(props);
    this.state = {refreshing: props.refreshing}

    this._dataSource = props.dataSource;

    this._onRefresh = props.onRefresh.bind(this);
    this._onPressRow = props.onPressRow.bind(this);
    this._onLongPressRow = props.onLongPressRow.bind(this);
    this._onEndReached = props.onEndReached.bind(this);
  }

  render() {
    return (
      <ListView
        style={styles.list_view}
        dataSource={this._dataSource}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={() => this._onRefresh()}
          />
        }
        renderRow={
          (entry: Object, sectionId: number, rowId: number) => {
            return (
              <TouchableHighlight
                onPress={() => this._onPressRow(entry)}
                onLongPress={() => this._onLongPressRow(entry)}
                style={styles.row}
                underlayColor="#AAAAAA">
                <View style={styles.row_inside}>
                  <Text style={styles.title}>{entry.title || entry.long_url}</Text>
                  <Text style={styles.short_url}>{entry.link}</Text>
                </View>
              </TouchableHighlight>
            );
          }
        }
        onEndReached={() => this._onEndReached()}
      />
    );
  }
}

const styles = StyleSheet.create({
  list_view: {
    flexDirection: "column",
    backgroundColor: "white",
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#4EA2D8",
  },
  row_inside: {
    margin: 9,
  },
  title: {
    color: "black",
    fontSize: 15,
    marginBottom: 5,
  },
  short_url: {
    color: "#EA4A0E",
    marginLeft: 5,
    marginBottom: 5,
  },
});
