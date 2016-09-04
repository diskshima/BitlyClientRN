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
  Navigator,
  BackAndroid,
  DrawerLayoutAndroid,
  Linking,
} = ReactNative;

var Utils = require('./utils')
var Login = require('./login');
var DrawerItem = require('./drawerItem');
var AddView = require('./addView');
var ReactUtils = require('./react_utils');
var Bitly = require('./bitly');

import LinkListView from './LinkListView';
import Edit from './Edit';

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
      navigator.replace({
        mode: Mode.Load,
      });
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
        return (
          <Edit bitly={bitly} link={link} navigator={navigator} />
        );
      case Mode.Add:
        return (
          <AddView url={this.state.newUrl} domain={this.state.domain}
            onAddPressed={(url, domain) => this._addButtonPressed(navigator, url, domain)}
          />
        );
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
          <LinkListView
            refreshing={this.state.refreshing}
            dataSource={this.state.dataSource}
            onRefresh={() => this._refreshList(navigator)}
            onPressRow={(entry) => this._openLink(entry)}
            onLongPressRow={(entry) => this._openEdit(entry, navigator)}
            onEndReached={() => this._loadMoreRows()}
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
  _setDomain: function (domain) {
    this.setState({
      domain: domain
    });
  },
  _openLink: function (entry) {
    var url = entry.link;
    Linking.openURL(url)
      .catch(err => console.error('Failed to open URL: ' + url, err));
  },
  _openEdit: function (entry, navigator) {
    var url = entry.link;
    navigator.push({
      mode: Mode.Edit,
      editLink: entry,
    });
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
  main: {
    flex: 1,
    flexDirection: "column",
  },
});

AppRegistry.registerComponent("BitlyClient", () => BitlyClient);
