/*
 * utils.js
 * Copyright (C) 2015 diskshima <diskshima@gmail.com>
 *
 * Distributed under terms of the MIT license.
 */

var CHAR_CODE_A = "A".charCodeAt(0);
var CHAR_CODE_LOWER_A = "a".charCodeAt(0);

function toBase64Char(index) {
  if (index <= 25) {
    return String.fromCharCode(index + CHAR_CODE_A);
  } else if (index <= 51) {
    return String.fromCharCode(index - 26 + CHAR_CODE_LOWER_A);
  } else if (index <= 61) {
    return (index - 52).toString();
  } else if (index == 62) {
    return "-";
  } else if (index == 63) {
    return "/";
  }
}

function bitMask(numBits) {
  return Math.pow(2, numBits) - 1;
}

var TWO_BIT_MASK = bitMask(2);
var FOUR_BIT_MASK = bitMask(4);
var SIX_BIT_MASK = bitMask(6);

var Utils = {
  buildUrl: function (url, parameters) {
    var qs = Utils.buildQueryString(parameters);

    if (qs.length) {
      url = url + "?" + qs;
    }

    return url;
  },
  buildQueryString: function (parameters) {
    var qs = "";

    for (var key in parameters) {
      var value = parameters[key];
      qs += encodeURIComponent(key) + "=" + encodeURIComponent(value) + "&";
    }

    if (qs.length) {
      qs = qs.substring(0, qs.length-1); //chop off last "&"
    }

    return qs;
  },
  toBase64: function (str) {
    var i;
    var currentChar;
    var bitsToUse;
    var bitsLeft = 0;
    var resultArray = [];
    var upper = 0;
    var lower;
    var index;

    for (i = 0; i < str.length; i++) {

      bitsToUse = 6 - bitsLeft;
      if (bitsLeft > 0) {
        upper = (str.charCodeAt(i-1) & bitMask(bitsLeft)) << bitsToUse;
      } else {
        upper = 0;
      }
      bitsLeft = 8 - bitsToUse;
      currentChar = str.charCodeAt(i);
      lower = (currentChar & (bitMask(bitsToUse) << bitsLeft)) >> bitsLeft;
      index = upper + lower;
      resultArray.push(toBase64Char(index));

      if (bitsLeft == 6) {
        index = currentChar & SIX_BIT_MASK;
        resultArray.push(toBase64Char(index));
        bitsLeft = 0;
      }
    }

    if (bitsLeft > 0) {
      index = (currentChar & bitMask(bitsLeft)) << (6-bitsLeft);
      resultArray.push(toBase64Char(index));
      if (bitsLeft == 2) {
        resultArray.push("==");
      } else if (bitsLeft == 4) {
        resultArray.push("=");
      }
    }

    return resultArray.join('');
  },
  addProtocol: function (url: string): string {
    var newUrl = url;
    if (url.indexOf("://") === -1) {
      newUrl = "http://" + url;
    }
    return newUrl;
  },
};

module.exports = Utils;
