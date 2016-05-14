/*
 * bitly.js
 * Copyright (C) 2015 diskshima <diskshima@diskshima-MBP.local>
 *
 * Distributed under terms of the MIT license.
 */

'use strict';

var React = require('react-native');

var {
  AsyncStorage,
} = React;

var Utils = require('./utils')

var BITLY_HOST_URL  = "https://api-ssl.bitly.com";
var BITLY_API_BASE_URL = BITLY_HOST_URL + "/v3";
var BITLY_ACCESS_TOKEN_KEY = "bitly_access_token";
var BITLY_LINK_LIST_KEY = "bitly_link_list_key";

var methods = Bitly.prototype;

function Bitly() {
}

methods.loadAccessTokenFromStorage = function (callback) {
  AsyncStorage.getItem(BITLY_ACCESS_TOKEN_KEY)
    .then((value) => {
      if (value) {
        this._accessToken = value;
        callback(this._accessToken);
        return;
      }

      callback(null);
    })
    .catch(err => {
      this._accessToken = value;
      console.error('Failed to read access token from storage.', err);
    });
};

methods.saveAccessTokenToStorage = function () {
  AsyncStorage.setItem(BITLY_ACCESS_TOKEN_KEY, this._accessToken)
    .then((error) => {
      if (error) {
        console.error("Failed to save access token with: " + error);
      }
    })
    .catch(err => console.error('Failed to save access token from storage.', err));
};

methods.clearAccessToken = function (callback) {
  AsyncStorage.setItem(BITLY_ACCESS_TOKEN_KEY, "")
    .then((error) => {
      if (error) {
        console.error("Failed to clear access token with: " + error);
      } else {
        this._accessToken = "";
      }
      callback(error);
    })
    .catch(err => console.error('Failed to clear access token from storage.', err));
};

methods.authenticate = function (username, password, callback) {
  var that = this;
  var params = {
    grant_type: "password",
    username: username,
    password: password,
  };

  var clientId = "YOUR_CLIENT_ID";
  var clientSecret = "YOUR_CLIENT_SECRET";
  var base64ClientInfo = Utils.toBase64(clientId + ":" + clientSecret);

  var url = BITLY_HOST_URL + "/oauth/access_token";
  var body = Utils.buildQueryString(params);

  console.info("Sending to:" + url);

  fetch(url, {
    method: "post",
    headers: {
      "Authorization": "Basic " + base64ClientInfo,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body,
  })
    .then((response) => response.json())
    .then((response) => {
      console.info("Login response: " + JSON.stringify(response));

      if (response.status_txt) {
        var errMsg = "Failed to login with " + response.status_txt;
        console.info(errMsg);
      } else {
        that._accessToken = response.access_token;
        that.saveAccessTokenToStorage();
      }
      return response;
    })
    .then((response) => callback(response))
    .catch(err => console.error('Failed to authenticate with bit.ly.', err));
};

methods.getMyLinks = function (params, callback) {
  var onlyArchived = params.onlyArchived;
  var force = params.force || false;
  var offset = params.offset || 0;
  var limit = params.limit || 50;

  if (onlyArchived || force || offset !== 0) {
    var archived = onlyArchived ? "on" : "off";
    var bitlyParams = {
      access_token: this._accessToken,
      archived: archived,
      offset: offset,
      limit: limit,
    };

    var linkHistoryPath = "/user/link_history";
    var url = Utils.buildUrl(BITLY_API_BASE_URL + linkHistoryPath, bitlyParams);

    fetch(url)
      .then((response) => response.json())
      .then((response) => {
        if (response.status_code !== 200) {
          console.error(linkHistoryPath + " call failed with " + resposne.status_txt);
        } else if (offset === 0) {
          AsyncStorage.setItem(BITLY_LINK_LIST_KEY, response)
            .then((error) => {
              if (error) {
                console.error("Failed to save links with %j", error);
              }
            })
        }
        return response;
      })
      .then(callback)
      .catch(err => console.error('Failed to retrieve links from server.', err));
  } else {
    AsyncStorage.getItem(BITLY_LINK_LIST_KEY)
      .then((value) => {
        if (value) {
          console.info("Fetched links from storage.");
          callback(value);
        } else {
          console.warn("Failed to retrieve links from storage. Fetching from web.");
          getMyLinks({ onlyArchived: onlyArchived, force: true }, callback);
        }
      })
      .catch(err => console.error('Failed to retrieve links from storage.', err));
  }

  return;
};

methods.addLink = function (url, domain, callback) {
  var params = {
    access_token: this._accessToken,
    longUrl: url,
    domain: domain,
  };

  var url = Utils.buildUrl(BITLY_API_BASE_URL + "/shorten", params);

  fetch(url)
    .then((response) => response.json())
    .then((response) => {
      callback(response);
      return response;
    })
    .catch(err => console.error('Failed to add link.', err));
};

methods.updateTitle = function (shortLink, title, callback) {
  var params = {
    access_token: this._accessToken,
    edit: "title",
    link: shortLink,
    title: title
  };

  this.sendLinkEdit(params, callback);
};

methods.archiveLink = function (shortLink, callback) {
  var params = {
    access_token: this._accessToken,
    edit: "archived",
    link: shortLink,
    archived: true,
  };

  this.sendLinkEdit(params, callback);
};

methods.unarchiveLink = function (shortLink, callback) {
  var params = {
    access_token: this._accessToken,
    edit: "archived",
    link: shortLink,
    archived: false,
  };

  this.sendLinkEdit(params, callback);
};

methods.sendLinkEdit = function (params, callback) {
  var url = Utils.buildUrl(BITLY_API_BASE_URL + "/user/link_edit", params);

  fetch(url)
    .then((response) => response.json())
    .then(callback)
    .catch(err => console.error('Failed to save edits', err));
};

methods.getDummyList = function () {
  return {
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
};

module.exports = Bitly;
