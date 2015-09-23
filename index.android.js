/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  ToastAndroid,
  TextInput,
  AsyncStorage,
  Navigator,
  BackAndroid
} = React;

var LinkAndroid = require('LinkAndroid');

var Login = require('./login');

var Bitly = require('./bitly');

var bitly = new Bitly();

var Mode = {
  Load: 0,
  Login: 1,
  List: 2,
  Edit: 3,
};

var BackButtonEventListenerSet = false;

var BitlyClient = React.createClass({
  getInitialState: function () {
    var sharedUrl = this.props.sharedUrl || "";

    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      newUrl: sharedUrl,
    };
  },
  fetchData: function (navigator) {
    bitly.getMyLinks((responseData) => {
      this.setState({
        dataSource: this.state.dataSource.cloneWithRows(responseData.data.link_history),
      });
      navigator.replace({
        mode: Mode.List,
      });
    });
  },
  fetchDummyData: function () {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(bitly.getDummyList().data.link_history),
      mode: Mode.List,
    });
  },
  _onLoginCallback: function (response, navigator) {
    ToastAndroid.show("Successfully logged in.", ToastAndroid.SHORT);
    this.fetchData(navigator);
  },
  render: function() {
    return (
      <Navigator
        initialRoute={{mode: Mode.Load}}
        renderScene={(route, navigator) => {
          var currentMode = route.mode;

          if (!BackButtonEventListenerSet) {
            BackAndroid.addEventListener('hardwareBackPress', () => {
              var routes = navigator.getCurrentRoutes();
              if (routes[routes.length-1].mode === Mode.Edit) {
                navigator.pop();
                return true;
              } else {
                return false;
              }
            });
            BackButtonEventListenerSet = true;
          }

          switch (currentMode) {
            case Mode.Load:
              return this.renderLoadingView(navigator);
            case Mode.Login:
              return (
                <Login bitly={bitly} callback={(response) => this._onLoginCallback(response, navigator)} />
              );
            case Mode.List:
              return this.renderList(navigator);
            case Mode.Edit:
              var link = route.editLink;
              return this.renderEdit(link, navigator);
            }
          }
        }
        />
    );
  },
  renderList: function (navigator) {
    return (
      <View style={styles.list}>
        <View style={styles.add_url_box}>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            onChangeText={(text) => this.setState({ newUrl: text })}
            value={this.state.newUrl}
          />
          <TouchableHighlight
            style={styles.button}
            onPress={this._addButtonClicked}>
            <Text style={styles.button_text}>+</Text>
          </TouchableHighlight>
        </View>
        <ListView
          dataSource={this.state.dataSource}
          renderRow={
            (entry: Object, sectionId: number, rowId: number) => {
              return (
                <TouchableHighlight
                  onPress={() => this._onPressRow(entry)}
                  onLongPress={() => this._onLongPressRow(entry, navigator)}
                  style={styles.row}>
                  <View style={styles.rowInside}>
                    <Text style={styles.title}>{entry.title}</Text>
                    <Text style={styles.short_url}>{entry.link}</Text>
                    <Text style={styles.long_url}>{entry.long_url}</Text>
                  </View>
                </TouchableHighlight>
              );
            }
          }
          style={styles.listView}
        />
      </View>
    );
  },
  renderEdit: function (link, navigator) {

    var showLink = this.state.newEditLink || link;

    return (
      <View style={styles.edit_page}>
        <Text>{showLink.link}</Text>
        <Text>{showLink.long_url}</Text>
        <TextInput value={showLink.title}
          onChangeText={(text) => {
            this.setState({
              newEditLink: {
                link: showLink.link,
                long_url: showLink.long_url,
                title: text,
              },
            });
          }} />
        <TouchableHighlight
          style={styles.button}
          onPress={() => this._updateButtonClicked(navigator)}>
          <Text style={styles.button_text}>Update</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.button}
          onPress={() => this._onArchive(showLink.link, navigator)}>
          <Text style={styles.button_text}>Archive</Text>
        </TouchableHighlight>
      </View>
    );
  },
  _onPressRow: function (entry) {
    var url = entry.link;
    ToastAndroid.show("Opening " + url + "...", ToastAndroid.SHORT);
    LinkAndroid.open(url);
  },
  _onLongPressRow: function (entry, navigator) {
    var url = entry.link;
    ToastAndroid.show("Editing " + url, ToastAndroid.SHORT);
    navigator.push({
      name: 'Edit Link',
      mode: Mode.Edit,
      editLink: entry,
    });
  },
  _onArchive: function (shortLink, navigator) {
    bitly.archiveLink(shortLink, (response) => {
      ToastAndroid.show("Archived " + response.data.link_edit.link, ToastAndroid.SHORT);
    });
    navigator.pop();
  },
  _addButtonClicked: function () {
    bitly.addLink(this.state.newUrl, (response) => {
      var data = response.data;
      ToastAndroid.show("Added " + data.url, ToastAndroid.SHORT);
    });
  },
  _updateButtonClicked: function (navigator) {
    var newEntry = this.state.newEditLink;

    if (!newEntry) {
      navigator.pop();
      return;
    }

    bitly.updateTitle(newEntry.link, newEntry.title, (response) => {
      var result = response.status_code;
      if (result === 200) {
        ToastAndroid.show("Updated title", ToastAndroid.SHORT);
      } else {
        var errorMessage = "Failed to update with code = " + result +
          ", message = " + response.status_txt;
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      }
      navigator.pop();
    });
  },
  renderLoadingView: function (navigator) {
    bitly.loadFromStorage((value) => {
      var name;
      var mode;
      if (value) {
        this.fetchData(navigator);
      } else {
        navigator.replace({
          mode: Mode.Login,
        });
      }
    });
    return (
      <View style={styles.loading}>
        <Text>Loading links...</Text>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#F5FCFF',
    borderWidth: 2,
    borderColor: '#4EA2D8',
    margin: 5,
  },
  rowInside: {
    margin: 5,
  },
  title: {
    fontSize: 15,
    height: 35,
    marginBottom: 5,
  },
  short_url: {
    color: '#EA4A0E',
    marginLeft: 5,
    marginBottom: 5,
  },
  long_url: {
    fontSize: 12,
    color: '#535353',
    marginBottom: 5,
  },
  list: {
    flex: 1,
  },
  listView: {
    backgroundColor: "#F5FCFF",
  },
  add_url_box: {
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#E2F5FD",
    width: 50,
  },
  button_text: {
    color: '#EA4A0E',
    textAlign: "center",
  },
  edit_page: {
    flex: 1,
    alignItems: 'center',
  },
});

AppRegistry.registerComponent('BitlyClient', () => BitlyClient);
