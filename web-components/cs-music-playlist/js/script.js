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
    var $body, music_library, music_playlist, music_settings, player, scroll_interval, stop;
    $body = $('body');
    music_library = cs.music_library;
    music_playlist = cs.music_playlist;
    music_settings = cs.music_settings;
    player = document.querySelector('cs-music-player');
    scroll_interval = 0;
    stop = false;
    return Polymer('cs-music-playlist', {
      list: [],
      created: function() {
        var _this = this;
        return cs.bus.on('player/play', function(id) {
          if (_this.list.length) {
            return _this.update(id);
          }
        });
      },
      ready: function() {
        switch (music_settings.repeat) {
          case 'none':
            this.shadowRoot.querySelector('[icon=repeat]').setAttribute('disabled', '');
            break;
          case 'one':
            this.shadowRoot.querySelector('[icon=repeat]').innerHTML = 1;
        }
        if (!music_settings.shuffle) {
          return this.shadowRoot.querySelector('[icon=random]').setAttribute('disabled', '');
        }
      },
      open: function() {
        var _this = this;
        $body.addClass('playlist');
        stop = false;
        return music_playlist.current(function(current_id) {
          return music_playlist.get_all(function(all) {
            var count, get_next_item, index, list;
            index = 0;
            list = [];
            count = all.length;
            get_next_item = function() {
              if (index < count) {
                return music_library.get_meta(all[index], function(data) {
                  data.playing = data.id === current_id ? 'yes' : 'no';
                  data.icon = cs.bus.state.player === 'playing' ? 'play' : 'pause';
                  data.artist_title = [];
                  if (data.artist) {
                    data.artist_title.push(data.artist);
                  }
                  if (data.title) {
                    data.artist_title.push(data.title);
                  }
                  data.artist_title = data.artist_title.join(' — ') || _('unknown');
                  list.push(data);
                  data = null;
                  ++index;
                  return get_next_item();
                });
              } else if (!stop) {
                _this.list = list;
                return scroll_interval = setInterval((function() {
                  var item, items_container;
                  items_container = _this.shadowRoot.querySelector('cs-music-playlist-items');
                  if (items_container) {
                    item = items_container.querySelector('cs-music-playlist-item[playing=yes]');
                    clearInterval(scroll_interval);
                    scroll_interval = 0;
                    return items_container.scrollTop = item.offsetTop;
                  }
                }), 100);
              }
            };
            return get_next_item();
          });
        });
      },
      play: function(e) {
        var _this = this;
        return music_playlist.current(function(old_id) {
          music_playlist.set_current(e.target.dataset.index);
          return music_playlist.current(function(id) {
            if (id !== old_id) {
              player.play(id);
              return _this.update(id);
            } else {
              player.play();
              return _this.update(id);
            }
          });
        });
      },
      update: function(new_id) {
        var _this = this;
        return this.list.forEach(function(data, index) {
          if (data.id === new_id) {
            _this.list[index].playing = 'yes';
            return _this.list[index].icon = cs.bus.state.player === 'playing' ? 'play' : 'pause';
          } else {
            _this.list[index].playing = 'no';
            return delete _this.list[index].icon;
          }
        });
      },
      back: function() {
        var items_container,
          _this = this;
        $body.removeClass('playlist');
        stop = true;
        items_container = this.shadowRoot.querySelector('cs-music-playlist-items');
        if (items_container) {
          items_container.style.opacity = 0;
        }
        return setTimeout((function() {
          _this.list = [];
          if (scroll_interval) {
            clearInterval(scroll_interval);
            return scroll_interval = 0;
          }
        }), 300);
      },
      repeat: function(e) {
        var control;
        control = e.target;
        music_settings.repeat = (function() {
          switch (music_settings.repeat) {
            case 'none':
              return 'all';
            case 'all':
              return 'one';
            case 'one':
              return 'none';
          }
        })();
        if (music_settings.repeat === 'none') {
          control.setAttribute('disabled', '');
        } else {
          control.removeAttribute('disabled');
        }
        return control.innerHTML = music_settings.repeat === 'one' ? 1 : '';
      },
      shuffle: function(e) {
        var control,
          _this = this;
        control = e.target;
        music_settings.shuffle = !music_settings.shuffle;
        if (!music_settings.shuffle) {
          control.setAttribute('disabled', '');
        } else {
          control.removeAttribute('disabled');
        }
        this.list = [];
        return music_playlist.current(function(id) {
          return music_playlist.refresh(function() {
            music_playlist.set_current_id(id);
            return _this.open();
          });
        });
      }
    });
  });

}).call(this);
