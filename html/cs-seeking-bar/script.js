// Generated by CoffeeScript 1.4.0

/**
 * @package     CleverStyle Music
 * @category    Web Components
 * @author      Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright   Copyright (c) 2014-2015, Nazar Mokrynskyi
 * @license     MIT License, see license.txt
*/


(function() {

  Polymer('cs-seeking-bar', {
    current_time: '00:00',
    duration: '00:00',
    ready: function() {
      var _this = this;
      this.addEventListener('click', function(e) {
        var percents, progress_container;
        progress_container = this.shadowRoot.querySelector('.progress-container');
        percents = (e.pageX - progress_container.offsetLeft - this.offsetLeft) / progress_container.clientWidth * 100;
        if (percents < 0 || percents > 100 || isNaN(percents)) {
          return;
        }
        return $(this).trigger('seeking-update', {
          percents: percents
        });
      });
      return cs.bus.on('player/pause', function() {
        return _this.setAttribute('blinking', '');
      }).on('player/play', function() {
        return _this.removeAttribute('blinking');
      }).on('player/resume', function() {
        return _this.removeAttribute('blinking');
      });
    }
  });

}).call(this);
