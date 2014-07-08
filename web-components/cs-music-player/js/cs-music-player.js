// Generated by CoffeeScript 1.4.0

/**
 * @package     CleverStyle Music
 * @category    Web Components
 * @author      Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright   Copyright (c) 2014, Nazar Mokrynskyi
 * @license     MIT License, see license.txt
*/


(function() {
  var music_library, music_storage;

  music_storage = navigator.getDeviceStorage('music');

  music_library = cs.music_library;

  Polymer('cs-music-player', {
    header: '',
    rescan: function() {
      return music_library.rescan(function() {
        this.clean_playlist();
        return alert('Rescanned successfully, playlist refreshed');
      });
    },
    play: function() {
      var root;
      root = this;
      return music_library.get_next_id_to_play(function(id) {
        return music_library.get(id, function(data) {
          return music_storage.get(data.name).onsuccess = function() {
            var player;
            player = AV.Player.fromURL(window.URL.createObjectURL(this.result));
            player.on('ready', function() {
              return this.device.device.node.context.mozAudioChannelType = 'content';
            });
            player.play();
            return music_library.get_meta(id, function(data) {
              if (data) {
                return root.header = "" + data.title + " - " + data.artist;
              } else {
                return root.header = '';
              }
            });
          };
        });
      });
    }
  });

}).call(this);
