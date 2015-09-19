/*
 * bitly.js
 * Copyright (C) 2015 diskshima <diskshima@diskshima-MBP.local>
 *
 * Distributed under terms of the MIT license.
 */

var Utils = require('./utils')

var BITLY_BASE_URL = "https://api-ssl.bitly.com/v3";
var accessToken = "YOUR_ACCESS_TOKEN";

var Bitly = {
  getMyLinks: function (callback) {
    var params = {
      access_token: accessToken,
    };

    var url = Utils.buildUrl(BITLY_BASE_URL + "/user/link_history", params);

    fetch(url)
      .then((response) => response.json())
      .then(callback)
      .done();

    return;
  },
  addLink: function (url, callback) {
    var params = {
      access_token: accessToken,
      longUrl: url
    };

    var url = Utils.buildUrl(BITLY_BASE_URL + "/shorten", params);

    fetch(url)
      .then((response) => response.json())
      .then(callback)
      .done();
  },
  updateTitle: function (shortLink, title, callback) {
    var params = {
      access_token: accessToken,
      edit: "title",
      link: shortLink,
      title: title
    };

    var url = Utils.buildUrl(BITLY_BASE_URL + "/user/link_edit", params);

    fetch(url)
      .then((response) => response.json())
      .then(callback)
      .done();
  },
  getDummyList: function () {
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
  },
};

module.exports = Bitly;
