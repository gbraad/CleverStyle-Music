// Generated by CoffeeScript 1.4.0

/**
 * @package     CleverStyle Music
 * @category    Web Components
 * @author      Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright   Copyright (c) 2014, Nazar Mokrynskyi
 * @license     MIT License, see license.txt
*/


(function() {

  document.webL10n.ready(function() {
    var $body, equalizer_presets, music_equalizer;
    $body = $('body');
    music_equalizer = cs.music_equalizer;
    equalizer_presets = document.querySelector('cs-music-equalizer-presets');
    return Polymer('cs-music-equalizer', {
      gain_levels: music_equalizer.get_gain_levels(),
      ready: function() {
        var gain_levels;
        gain_levels = this.gain_levels;
        return $(this.shadowRoot.querySelectorAll('input[type=range]')).ranger({
          vertical: true,
          label: false,
          min: -10,
          max: 10,
          step: .01,
          callback: function(val) {
            gain_levels[$(this).prev().data('index')] = Math.round(val * 100) / 100;
            return music_equalizer.set_gain_levels(gain_levels);
          }
        });
      },
      update: function(gain_levels) {
        var _this = this;
        $(this.shadowRoot.querySelectorAll('input[type=range]')).ranger('destroy');
        this.gain_levels = gain_levels;
        music_equalizer.set_gain_levels(gain_levels);
        return setTimeout((function() {
          return _this.ready();
        }), 100);
      },
      open: function() {
        return $body.addClass('equalizer');
      },
      equalizer_presets: function() {
        return equalizer_presets.open();
      },
      back: function() {
        return $body.removeClass('equalizer');
      }
    });
  });

}).call(this);
