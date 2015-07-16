// Generated by CoffeeScript 1.4.0

/**
 * @package     CleverStyle Music
 * @category    app
 * @author      Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright   Copyright (c) 2014-2015, Nazar Mokrynskyi
 * @license     MIT License, see license.txt
*/


(function() {

  if (!window.cs) {
    window.cs = {};
  }

  /**
   * Randomize array element order in-place.
   * Using Fisher-Yates shuffle algorithm.
  */


  Array.prototype.shuffle = function() {
    var j, length, temp;
    length = this.length;
    if (length === 0) {
      return this;
    }
    while (--length) {
      j = Math.floor(Math.random() * (length + 1));
      temp = this[length];
      this[length] = this[j];
      this[j] = temp;
    }
    return this;
  };

  /**
   * Remove duplicates
  */


  Array.prototype.unique = function() {
    var _this = this;
    return this.filter(function(item, index, array) {
      return array.indexOf(item) === index;
    });
  };

  window.time_format = function(time) {
    var min, sec;
    min = Math.floor(time / 60);
    sec = Math.floor(time % 60);
    if (min < 10) {
      min = "0" + min;
    }
    if (sec < 10) {
      sec = "0" + sec;
    }
    return min + ':' + sec;
  };

}).call(this);
