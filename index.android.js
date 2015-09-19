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
  ToastAndroid
} = React;

var LinkAndroid = require('LinkAndroid');

var BITLY_LINKS_URL = "https://api-ssl.bitly.com/v3/user/link_history?access_token=";

var DUMMY_RESPONSE = {
  "data": {
    "link_history": [
      {
        "aggregate_link": "http://4sq.com/bGUucR",
        "archived": false,
        "client_id": "a5a2e024b030d6a594be866c7be57b5e2dff9972",
        "created_at": 1331669360,
        "link": "http://4sq.com/xnRb5V",
        "long_url": "http://foursquare.com/",
        "modified_at": 1331669360,
        "private": false,
        "title": null,
        "user_ts": 1331669360
      },
      {
        "aggregate_link": "http://nyti.ms/16tOHV",
        "archived": false,
        "client_id": "a5a2e024b030d6a594be866c7be57b5e2dff9972",
        "created_at": 1331669349,
        "link": "http://nyti.ms/xr5jgq",
        "long_url": "http://nytimes.com/",
        "modified_at": 1331669350,
        "private": false,
        "title": "The New York Times - Breaking News, World News & Multimedia",
        "user_ts": 1331669349
      },
      {
        "aggregate_link": "http://bit.ly/2V6CFi",
        "archived": false,
        "client_id": "a5a2e024b030d6a594be866c7be57b5e2dff9972",
        "created_at": 1331663117,
        "link": "http://bit.ly/zhheQ9",
        "long_url": "http://www.google.com/",
        "modified_at": 1331663117,
        "private": false,
        "title": "Google",
        "user_ts": 1331663117
      }
    ],
    "result_count": 3
  },
  "status_code": 200,
  "status_txt": "OK"
};

var BitlyClient = React.createClass({
  getInitialState: function () {
    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      loaded: false,
    };
  },
  componentDidMount: function () {
    var accessToken = "20a105c17b2346ac684d0eeb919a251e5ee7664e";
    this.fetchData(accessToken);
    // this.fetchDummyData(accessToken);
  },
  fetchData: function (accessToken) {
    var url = BITLY_LINKS_URL + accessToken;
    fetch(url)
      .then((response) => response.json())
      .then((responseData) => {
        this.setState({
          dataSource: this.state.dataSource.cloneWithRows(responseData.data.link_history),
          loaded: true,
        });
      })
      .done();
  },
  fetchDummyData: function (accessToken) {
    this.setState({
      dataSource: this.state.dataSource.cloneWithRows(DUMMY_RESPONSE.data.link_history),
      loaded: true,
    });
  },
  render: function() {
    if (!this.state.loaded) {
      return this.renderLoadingView();
    }

    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={this._renderRow}
        style={styles.listView}
      />
    );
  },
  _renderRow: function (entry: Object, sectionId: number, rowId: number) {
    return (
      <TouchableHighlight onPress={() => this._onPressRow(entry)}>
        <View style={styles.container}>
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
  renderLoadingView: function () {
    return (
      <View style={styles.container}>
        <Text>Loading links...</Text>
      </View>
    );
  },
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#F5FCFF',
    borderWidth: 2,
    borderColor: '#4EA2D8',
  },
  title: {
    fontSize: 18,
    margin: 10,
  },
  short_url: {
    color: '#EA4A0E',
    paddingBottom: 5,
  },
  long_url: {
    fontSize: 12,
    color: '#535353',
    paddingBottom: 5,
  },
  listView: {
    backgroundColor: "#F5FCFF",
  },
});

AppRegistry.registerComponent('BitlyClient', () => BitlyClient);
