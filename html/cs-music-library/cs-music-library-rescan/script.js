// Generated by CoffeeScript 1.4.0

/**
 * @package     CleverStyle Music
 * @category    Web Components
 * @author      Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright   Copyright (c) 2014-2015, Nazar Mokrynskyi
 * @license     MIT License, see license.txt
*/


(function() {

  document.webL10n.ready(function() {
    var $body, music_playlist, player;
    $body = $('body');
    music_playlist = cs.music_playlist;
    player = document.querySelector('cs-music-player');
    return Polymer('cs-music-library-rescan', {
      searching_for_music_text: _('searching-for-music'),
      files_found_text: _('files-found'),
      found: 0,
      created: function() {
        var _this = this;
        return cs.bus.on('library/rescan/found', function(found) {
          return _this.found = found;
        });
      },
      open: function() {
        var _this = this;
        $body.addClass('library-rescan');
        if (!this.found) {
          return cs.music_library.rescan(function() {
            music_playlist.refresh();
            alert(_('library-rescanned-playlist-updated'));
            $body.removeClass('library-rescan menu');
            return setTimeout((function() {
              _this.found = 0;
              return player.next(function() {
                return player.play();
              });
            }), 200);
          });
        }
      },
      back: function() {
        return $body.removeClass('library-rescan');
      }
    });
  });

}).call(this);
