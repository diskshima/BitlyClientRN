/**
 * bit.ly Client for Android in React Native
 *
 * Main class
 */
'use strict';

var React = require('react');
var ReactNative = require('react-native');
import Icon from 'react-native-vector-icons/Octicons';

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
  TextInput,
  Navigator,
  BackAndroid,
  DrawerLayoutAndroid,
  Linking,
  Picker,
  RefreshControl,
} = ReactNative;

var Utils = require('./utils')
var Button = require('./button');
var Login = require('./login');
var DrawerItem = require('./drawerItem');
var AddView = require('./addView');
var ReactUtils = require('./react_utils');
var Bitly = require('./bitly');
var Share = require('react-native-share');

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
  currentLinks: [],
  isLoadingMore: false,
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
      refreshing: false,
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
        this.setState({
          refreshing: false,
        });
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
        <DrawerItem
          onPress={() => this._onShortenClicked(navigator)}
          iconName="plus"
          text="Shorten New" />
        <DrawerItem
          onPress={() => this._onArchivedToggle(navigator)}
          iconName="package"
          text={archiveMenu} />
        <DrawerItem
          onPress={() => this._onLogoutClicked(navigator)}
          iconName="sign-out"
          text="Logout" />
      </View>
    );

    return (
      <DrawerLayoutAndroid
        drawerWidth={200}
        drawerPosition={DrawerLayoutAndroid.positions.Left}
        ref={this.setDrawerInstance}
        renderNavigationView={() => drawerView}>
        <View style={styles.main}>
          <View style={styles.topmenu}>
            <Icon name="three-bars" size={35} color="black" onPress={this._openDrawer} />
          </View>
          <ListView
            style={styles.list_view}
            dataSource={this.state.dataSource}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={() => this._refreshList(navigator)}
              />
            }
            renderRow={
              (entry: Object, sectionId: number, rowId: number) => {
                return (
                  <TouchableHighlight
                    onPress={() => this._onPressRow(entry)}
                    onLongPress={() => this._onLongPressRow(entry, navigator)}
                    style={styles.row}
                    underlayColor="#AAAAAA">
                    <View style={styles.rowInside}>
                      <Text style={styles.title}>{entry.title || entry.long_url}</Text>
                      <Text style={styles.short_url}>{entry.link}</Text>
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
  drawerInstance: {
    instance : {
      openDrawer : function() {
        console.warn('Default empty implementation.');
      }
    }
  },
  setDrawerInstance: function (instance) {
    this.drawerInstance.instance = instance;
  },
  _openDrawer: function () {
    this.drawerInstance.instance.openDrawer();
  },
  _loadMoreRows: function () {
    ReactUtils.showToast("Loading more data...");

    if (this.isLoadingMore) {
      console.info("Already loading more.");
      return;
    }

    this.isLoadingMore = true;
    bitly.getMyLinks(
      {
        onlyArchived: this.state.showOnlyArchived,
        offset: this.currentLinks.length,
      },
      (response) => {
        const newLinks = response.data.link_history;

        if (response.status_code === 200) {
          this.currentLinks = this.currentLinks.concat(newLinks);
          this.isLoadingMore = false;
          this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.currentLinks),
            refreshing: false
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
      <AddView
        url={this.state.newUrl}
        domain={this.state.domain}
        onAddPressed={(url, domain) => this._addButtonPressed(navigator, url, domain)}
      />
    );
  },
  _onPressRow: function (entry) {
    var url = entry.link;
    Linking.openURL(url)
      .catch(err => console.error('Failed to open URL: ' + url, err));
  },
  _onLongPressRow: function (entry, navigator) {
    var url = entry.link;
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
          this.renderLoadingView(navigator);
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
          this.renderLoadingView(navigator);
        } else {
          var errMsg = "Failed to archive with " + response.status_code + ": "
            + response.status_txt;
          ReactUtils.showToast(errMsg);
        }
      });
    }
    navigator.pop();
  },
  _refreshList: function (navigator) {
    this.setState({
      newUrl: '',
      refreshing: true,
    });

    navigator.replace({
      mode: Mode.List,
      forceRefresh: true
    });
  },
  _addButtonPressed: function (navigator, urlEntered, domainSelected) {
    var url = Utils.addProtocol(urlEntered);

    bitly.loadAccessTokenFromStorage((value) => {
      if (value) {
        bitly.addLink(url, domainSelected,
          (response) => {
            var data = response.data;
            var message = response.status_txt;

            if (response.status_code === 200) {
              ReactUtils.showToast("Added " + data.url);
              this.renderLoadingView(navigator);
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
  topmenu: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
    height: 50,
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#4EA2D8",
  },
  rowInside: {
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
  main: {
    flex: 1,
    flexDirection: "column",
  },
  list_view: {
    flexDirection: "column",
    backgroundColor: "white",
  },
  edit_page: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
  },
});

AppRegistry.registerComponent("BitlyClient", () => BitlyClient);
