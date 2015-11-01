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
  TextInput,
  AsyncStorage,
  Navigator,
  BackAndroid,
  DrawerLayoutAndroid,
} = React;

var LinkAndroid = require('LinkAndroid');
var Utils = require('./utils')
var Button = require('./button');
var Login = require('./login');
var ReactUtils = require('./react_utils');
var Bitly = require('./bitly');
var Share = require('react-native-share');

var DropDown = require('react-native-dropdown');

var {
  Select,
  Option,
  OptionList,
  updatePosition
} = DropDown;

var bitly = new Bitly();

var Mode = {
  Load: 0,
  Login: 1,
  List: 2,
  Edit: 3,
  Add: 4,
};

var BackButtonEventListenerSet = false;

var BitlyClient = React.createClass({
  optionList: undefined,
  currentLinks: [],
  getInitialState: function () {
    var sharedUrl = this.props.sharedUrl;
    var mode = sharedUrl ? Mode.Add : Mode.Load;

    return {
      dataSource: new ListView.DataSource({
        rowHasChanged: (row1, row2) => row1 !== row2,
      }),
      newUrl: sharedUrl,
      initialMode: mode,
      showOnlyArchived: false,
    };
  },
  fetchData: function (navigator) {
    var forceRefresh = this.state.forceRefresh;

    if (this.state.forceRefresh === undefined) {
      forceRefresh = true;
    }

    bitly.getMyLinks(
      {
        onlyArchived: this.state.showOnlyArchived,
        force: forceRefresh,
      },
      (response) => {
        if (response.status_code === 200) {
          this.currentLinks = response.data.link_history;
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.currentLinks),
          });
        } else {
          var errMsg = "Failed to get links with " + response.status_code + ": "
            + response.status_txt;
          ReactUtils.showToast(errMsg);
        }
        navigator.replace({
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
  _onLoginCallback: function (response, navigator) {
    if (response.status_txt) {
      var errMsg = "Failed to login with " + response.status_code + ": "
        + response.status_txt;
      ReactUtils.showToast(errMsg);
    } else {
      ReactUtils.showToast("Successfully logged in.");
      this.fetchData(navigator);
    }
  },
  render: function() {
    return (
      <Navigator
        initialRoute={{mode: this.state.initialMode}}
        renderScene={this._renderScene}
        />
    );
  },
  _renderScene: function (route, navigator) {
    var currentMode = route.mode;

    if (!BackButtonEventListenerSet) {
      BackAndroid.addEventListener("hardwareBackPress", () => {
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
          <Login bitly={bitly}
            callback={(response) => this._onLoginCallback(response, navigator)} />
        );
      case Mode.List:
        return this.renderList(navigator);
      case Mode.Edit:
        var link = route.editLink;
        return this.renderEdit(link, navigator);
      case Mode.Add:
        return this._renderAdd(navigator);
    }
  },
  _onShortenClicked: function (navigator) {
    navigator.replace({
      mode: Mode.Add,
    });
  },
  _onArchivedToggle: function (navigator) {
    this.setState({
      showOnlyArchived: !this.state.showOnlyArchived,
    });

    this.renderLoadingView(navigator);
  },
  renderList: function (navigator) {
    var archiveMenu = this.state.showOnlyArchived ? "Show Links" : "Show Archived";

    var drawerView = (
      <View>
        <TouchableHighlight
          style={styles.drawer}
          onPress={() => this._onShortenClicked(navigator)}>
          <Text style={styles.drawer_item}>Shorten New Link</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.drawer}
          onPress={() => this._onArchivedToggle(navigator)}>
          <Text style={styles.drawer_item}>{archiveMenu}</Text>
        </TouchableHighlight>
        <TouchableHighlight
          style={styles.drawer}
          onPress={() => this._onLogoutClicked(navigator)}>
          <Text style={styles.drawer_item}>Logout</Text>
        </TouchableHighlight>
      </View>
    );

    return (
      <DrawerLayoutAndroid
        drawerWidth={150}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        renderNavigationView={() => drawerView}>
        <View style={styles.main}>
          <Button
            style={styles.refresh_button}
            onPress={() => this._refreshList(navigator, true)}
            text="Refresh" />
          <ListView
            style={styles.list_view}
            dataSource={this.state.dataSource}
            renderRow={
              (entry: Object, sectionId: number, rowId: number) => {
                return (
                  <TouchableHighlight
                    onPress={() => this._onPressRow(entry)}
                    onLongPress={() => this._onLongPressRow(entry, navigator)}
                    style={styles.row}
                    underlayColor="#AAAAAA">
                    <View style={styles.rowInside}>
                      <Text style={styles.title}>{entry.title}</Text>
                      <Text style={styles.short_url}>{entry.link}</Text>
                      <Text style={styles.long_url}>{entry.long_url}</Text>
                    </View>
                  </TouchableHighlight>
                );
              }
            }
            onEndReached={this._loadMoreRows}
          />
        </View>
      </DrawerLayoutAndroid>
    );
  },
  _loadMoreRows: function () {
    ReactUtils.showToast("Loading more data...");
    bitly.getMyLinks(
      {
        onlyArchived: this.state.showOnlyArchived,
        offset: this.currentLinks.length,
      },
      (response) => {
        const newLinks = response.data.link_history;
        if (response.status_code === 200) {
          this.currentLinks = this.currentLinks.concat(newLinks);
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.currentLinks),
          });
        } else {
          var errMsg = "Failed to unarchive with " + response.status_code + ": "
            + response.status_txt;
          ReactUtils.showToast(errMsg);
        }
      }
    );
  },
  renderEdit: function (link, navigator) {

    var showLink = this.state.newEditLink || link;
    var isArchived = showLink.archived;
    var archiveButtonText = isArchived ? "Unarchive" : "Archive";

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
                archived: showLink.archived,
                title: text,
              },
            });
          }} />
        <Button
          onPress={() => this._updateButtonClicked(navigator)}
          text="Update" />
        <Button
          onPress={() => this._onShare(showLink.link, navigator)}
          text="Share" />
        <Button
          onPress={() => this._onArchive(showLink, navigator)}
          text={archiveButtonText} />
      </View>
    );
  },
  _setDomain: function (domain) {
    this.setState({
      domain: domain
    });
  },
  _renderAdd: function (navigator) {
    return (
      <View style={styles.add_url_box}>
        <View style={styles.top_buttons}>
          <Button
            style={styles.add_button}
            onPress={() => this._addButtonPressed(navigator)}
            text="+" />
        </View>
        <Text>New URL to shorten</Text>
        <TextInput
          style={styles.input_field}
          onChangeText={(text) => this.setState({ newUrl: text })}
          value={this.state.newUrl}
        />
        <Select
          width={100}
          ref="DOMAIN"
          defaultValue="bit.ly"
          optionListRef={() => this.optionList}
          onSelect={(domain) => this._setDomain(domain) }>
          <Option>bit.ly</Option>
          <Option>bitly.com</Option>
          <Option>j.mp</Option>
        </Select>
        <OptionList ref={(c) => this.optionList = c} />
      </View>
    );
  },
  _onPressRow: function (entry) {
    var url = entry.link;
    ReactUtils.showToast("Opening " + url + "...");
    LinkAndroid.open(url);
  },
  _onLongPressRow: function (entry, navigator) {
    var url = entry.link;
    ReactUtils.showToast("Editing " + url);
    navigator.push({
      mode: Mode.Edit,
      editLink: entry,
    });
  },
  _onArchive: function (link, navigator) {
    if (link.archived) {
      bitly.unarchiveLink(link.link, (response) => {
        if (response.status_code === 200) {
          ReactUtils.showToast("Unarchived " + response.data.link_edit.link);
          this._refreshList(navigator, true);
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
          this._refreshList(navigator, true);
        } else {
          var errMsg = "Failed to archive with " + response.status_code + ": "
            + response.status_txt;
          ReactUtils.showToast(errMsg);
        }
      });
    }
    navigator.pop();
  },
  _refreshList: function (navigator, forceRefresh) {
    this.setState({
      newUrl: '',
    });

    navigator.replace({
      mode: Mode.Load,
      forceRefresh: forceRefresh
    });
  },
  _addButtonPressed: function (navigator) {
    if (this.state.newUrl === undefined) {
      ReactUtils.showToast("Please enter a URL.");
      return;
    }

    var url = Utils.addProtocol(this.state.newUrl);
    var domain = this.state.domain || "bit.ly";

    bitly.loadAccessTokenFromStorage((value) => {
      if (value) {
        bitly.addLink(url, domain,
          (response) => {
            var data = response.data;
            var message = response.status_txt;

            if (response.status_code === 200) {
              ReactUtils.showToast("Added " + data.url);
              this._refreshList(navigator, true);
            } else {
              console.error("Failed with " + response.status_code + ": " + message);
              ReactUtils.showToast("Error: " + message);
            }
          }
        );
      } else {
        // FIXME This will render to the list eventually. Instead continue
        //   adding the link
        navigator.replace({
          mode: Mode.Login,
        });
      }
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
        ReactUtils.showToast("Updated title");
      } else {
        var errorMessage = "Failed to update with " + result + ": " +
          ": " + response.status_txt;
        ReactUtils.showToast(errorMessage);
      }
      navigator.pop();
    });
  },
  _onShare: function (shortLink, navigator) {
    Share.open({
      share_text: "",
      share_URL: shortLink,
      title: "Share Link",
    }, function (error) {
      console.error(error);
    });
  },
  _onLogoutClicked: function (navigator) {
    bitly.clearAccessToken((error) => {
      if (error) {
        ReactUtils.showToast("Failed to logout");
      } else {
        navigator.replace({
          mode: Mode.Login,
        });
      }
    });
  },
  renderLoadingView: function (navigator) {
    bitly.loadAccessTokenFromStorage((value) => {
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
    alignItems: "center",
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#F5FCFF",
    borderWidth: 2,
    borderColor: "#4EA2D8",
    margin: 5,
  },
  rowInside: {
    margin: 5,
  },
  title: {
    fontSize: 15,
    marginBottom: 5,
  },
  short_url: {
    color: "#EA4A0E",
    marginLeft: 5,
    marginBottom: 5,
  },
  long_url: {
    fontSize: 12,
    color: "#535353",
    marginBottom: 5,
  },
  main: {
    flex: 1,
    flexDirection: "column",
  },
  add_url_box: {
  },
  list_view: {
    flexDirection: "column",
    backgroundColor: "#F5FCFF",
  },
  input_field: {
  },
  edit_page: {
    flex: 1,
    alignItems: "center",
  },
  top_buttons: {
    flexDirection: "row",
  },
  add_button: {
    margin: 5,
  },
  refresh_button: {
    margin: 5,
  },
  drawer: {
    padding: 10,
    backgroundColor: "#4EA2D8",
  },
  drawer_item: {
    fontSize: 15,
  }
});

AppRegistry.registerComponent("BitlyClient", () => BitlyClient);
