/**
 * Edit.js - Edit page component
 */
'use strict';

import React, { Component } from 'react';
import { View, Text, TextInput, Dimensions, StyleSheet } from 'react-native';

import Share from 'react-native-share';

import ReactUtils from './react_utils';
import Button from './button';

export default class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {title: props.link.title };

    this._bitly = props.bitly;
    this._link = props.link;
    this._navigator = props.navigator;
    this._updateButtonClicked = this._updateButtonClicked.bind(this);
    this._onShare = this._onShare.bind(this);
    this._onArchive = this._onArchive.bind(this);
  }

  render() {
    const link = this._link;
    var isArchived = link.archived;
    var archiveButtonText = isArchived ? "Unarchive" : "Archive";
    var width = Dimensions.get('window').width;

    return (
      <View style={styles.edit_page}>
        <Text>{link.link}</Text>
        <Text>{link.long_url}</Text>
        <TextInput value={link.title}
          style={{width: width * 0.8}}
          onChangeText={(text) => {
            this.setState({ title: text });
          }} />
        <Button onPress={this._updateButtonClicked} text="Update" />
        <Button onPress={this._onShare} text="Share" />
        <Button onPress={this._onArchive} text={archiveButtonText} />
      </View>
    );
  }

  _updateButtonClicked() {
    bitly.updateTitle(this._link.link, this.state.title, (response) => {
      var result = response.status_code;
      if (result === 200) {
        ReactUtils.showToast("Updated title");
      } else {
        var errorMessage = "Failed to update with " + result + ": " +
          ": " + response.status_txt;
        ReactUtils.showToast(errorMessage);
      }
      this._navigator.pop();
    });
  }

  _onShare(shortLink) {
    Share.open({
      share_text: "",
      share_URL: shortLink,
      title: "Share Link",
    }, console.error);
  }

  _onArchive(link) {
    if (link.archived) {
      bitly.unarchiveLink(link.link, (response) => {
        if (response.status_code === 200) {
          ReactUtils.showToast("Unarchived " + response.data.link_edit.link);
          this.renderLoadingView(this._navigator);
        } else {
          var errMsg = "Failed to unarchive with " + response.status_code + ": "
            + response.status_txt;
          ReactUtils.showToast(errMsg);
        }
      });
    } else {
      bitly.archiveLink(link.link, (response) => {
        if (response.status_code === 200) {
          ReactUtils.showToast("Archived " + response.data.link_edit.link);
          this.renderLoadingView(this._navigator);
        } else {
          var errMsg = "Failed to archive with " + response.status_code + ": "
            + response.status_txt;
          ReactUtils.showToast(errMsg);
        }
      });
    }
    this._navigator.pop();
  }
}

const styles = StyleSheet.create({
  edit_page: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  }
});
