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
} = React;

var Login = require('./login');

var LinkAndroid = require('LinkAndroid');

var Bitly = require('./bitly');

var bitly = new Bitly();

var Mode = {
  Loading: 0,
  List: 1,
  Edit: 2,
  Authenticating: 3,
};

var BitlyClient = React.createClass({
  getInitialState: function () {
    var mode;
    return {
      mode: Mode.Authenticating,
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      newUrl: "",
      editLink: {
        link: "",
        title: "",
        long_url: "",
      },
    };
  },
  componentDidMount: function () {
    // this.fetchData();
    // this.fetchDummyData();
  },
  fetchData: function () {
    bitly.getMyLinks((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.data.link_history),
          mode: Mode.List,
        });
      }
    );
  },
  fetchDummyData: function () {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(bitly.getDummyList().data.link_history),
      mode: Mode.List,
    });
  },
  _onLoginCallback: function (response) {
    ToastAndroid.show("Successfully logged in.", ToastAndroid.SHORT);
    this.fetchData();
  },
  render: function() {
    var currentMode = this.state.mode;

    if (currentMode === Mode.Authenticating) {
      return (
        <Login bitly={bitly} callback={(response) => this._onLoginCallback(response)} />
      );
    }

    if (currentMode === Mode.Loading) {
      return this.renderLoadingView();
    } else if (currentMode === Mode.List) {
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
              onPress={this._addButtonClicked.bind(this)}>
              <Text style={styles.add_button_text}>+</Text>
            </TouchableHighlight>
          </View>
          <ListView
            dataSource={this.state.dataSource}
            renderRow={this._renderRow}
            style={styles.listView}
          />
        </View>
      );
    } else if (currentMode === Mode.Edit) {
      var link = this.state.editLink;

      return (
        <View style={styles.edit_page}>
          <Text>{link.link}</Text>
          <Text>{link.long_url}</Text>
          <TextInput value={link.title}
            onChangeText={(text) =>
              this.setState({
                editLink: {
                  link: link.link,
                  long_url: link.long_url,
                  title: text,
                }
              })
            } />
          <TouchableHighlight
            style={styles.button}
            onPress={this._updateButtonClicked.bind(this)}>
            <Text style={styles.add_button_text}>Update</Text>
          </TouchableHighlight>
        </View>
      );
    }
  },
  _renderRow: function (entry: Object, sectionId: number, rowId: number) {
    return (
      <TouchableHighlight onPress={() => this._onPressRow(entry)}
        onLongPress={() => this._onLongPressRow(entry)}
        style={styles.row}>
        <View style={styles.rowInside}>
          <Text style={styles.title}>{entry.title}</Text>
          <Text style={styles.short_url}>{entry.link}</Text>
          <Text style={styles.long_url}>{entry.long_url}</Text>
        </View>
      </TouchableHighlight>
    );
  },
  _onPressRow: function (entry) {
    var url = entry.link;
    ToastAndroid.show("Opening " + url + "...", ToastAndroid.SHORT);
    LinkAndroid.open(url);
  },
  _onLongPressRow: function (entry) {
    var url = entry.link;
    ToastAndroid.show("Editing " + url, ToastAndroid.SHORT);
    this.setState({
      mode: Mode.Edit,
      editLink: entry,
    });
  },
  _addButtonClicked: function () {
    bitly.addLink(this.state.newUrl, (response) => {
      var data = response.data;
      ToastAndroid.show("Added " + data.url, ToastAndroid.SHORT);
    });
  },
  _updateButtonClicked: function () {
    var newEntry = this.state.editLink;
    bitly.updateTitle(newEntry.link, newEntry.title, (response) => {
      var result = response.status_code;
      if (result === 200) {
        ToastAndroid.show("Updated title", ToastAndroid.SHORT);
        this.setState({
          mode: Mode.List,
          editLink: {
            link: "",
            title: "",
            long_url: "",
          },
        });
      } else {
        var errorMessage = "Failed to update with code = " + result +
          ", message = " + response.status_txt;
        ToastAndroid.show(errorMessage, ToastAndroid.SHORT);
      }
    });
  },
  renderLoadingView: function () {
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
  add_button_text: {
    color: '#EA4A0E',
    textAlign: "center",
  },
  edit_page: {
    flex: 1,
    alignItems: 'center',
  },
});

AppRegistry.registerComponent('BitlyClient', () => BitlyClient);
