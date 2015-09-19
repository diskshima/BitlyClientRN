/*
 * utils.js
 * Copyright (C) 2015 diskshima <diskshima@diskshima-MBP.local>
 *
 * Distributed under terms of the MIT license.
 */

var Utils = {
  buildUrl: function (url, parameters) {
    var qs = "";
    for(var key in parameters) {
      var value = parameters[key];
      qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }
    if (qs.length > 0){
      qs = qs.substring(0, qs.length-1); //chop off last "&"
      url = url + "?" + qs;
    }
    return url;
  },
};

module.exports = Utils;
