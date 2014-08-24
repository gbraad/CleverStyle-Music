// Generated by CoffeeScript 1.4.0

/**
 * @package     CleverStyle Music
 * @category    Web Components
 * @author      Nazar Mokrynskyi <nazar@mokrynskyi.com>
 * @copyright   Copyright (c) 2014, Nazar Mokrynskyi
 * @license     MIT License, see license.txt
*/


(function() {
  var body, music_library, music_playlist, music_settings, music_storage, seeking_bar, sound_processing;

  music_storage = navigator.getDeviceStorage('music');

  sound_processing = cs.sound_processing;

  music_library = cs.music_library;

  music_playlist = cs.music_playlist;

  music_settings = cs.music_settings;

  body = document.querySelector('body');

  seeking_bar = null;

  Polymer('cs-music-player', {
    title: '',
    artist: '',
    ready: function() {
      var _this = this;
      seeking_bar = this.shadowRoot.querySelector('cs-seeking-bar');
      $(seeking_bar).on('seeking-update', function(e, data) {
        return _this.seeking(data.percents);
      });
      this.player = (function() {
        var aurora_player, object_url, play_with_aurora, player_element, playing_started;
        player_element = document.createElement('audio');
        sound_processing.add_to_element(player_element.impl);
        cs.bus.on('equalizer/update', function() {
          return sound_processing.update(player_element.impl);
        });
        aurora_player = null;
        playing_started = 0;
        player_element.mozAudioChannelType = 'content';
        object_url = null;
        player_element.addEventListener('loadeddata', function() {
          URL.revokeObjectURL(object_url);
          return object_url = null;
        });
        player_element.addEventListener('error', function() {
          if (new Date - playing_started > 1000) {
            return _this.player.pause();
          } else {
            return play_with_aurora();
          }
        });
        player_element.addEventListener('ended', function() {
          _this.play();
          switch (music_settings.repeat) {
            case 'one':
              return music_playlist.current(function(id) {
                return _this.play(id);
              });
            default:
              return _this.next();
          }
        });
        player_element.addEventListener('timeupdate', function() {
          var current_time, duration;
          current_time = player_element.currentTime;
          duration = player_element.duration;
          seeking_bar.current_time = time_format(current_time);
          seeking_bar.duration = duration ? time_format(duration) : '00:00';
          return seeking_bar.progress_percentage = duration ? current_time / duration * 100 : 0;
        });
        play_with_aurora = function() {
          aurora_player = AV.Player.fromURL(object_url);
          aurora_player.on('ready', function() {
            return this.device.device.node.context.mozAudioChannelType = 'content';
          });
          aurora_player.on('end', function() {
            _this.play();
            switch (music_settings.repeat) {
              case 'one':
                return music_playlist.current(function(id) {
                  return _this.play(id);
                });
              default:
                return _this.next();
            }
          });
          aurora_player.on('duration', function(duration) {
            duration /= 1000;
            return aurora_player.on('progress', function() {
              var current_time;
              current_time = aurora_player.currentTime / 1000;
              seeking_bar.current_time = time_format(current_time);
              seeking_bar.duration = duration ? time_format(duration) : '00:00';
              return seeking_bar.progress_percentage = duration ? current_time / duration * 100 : 0;
            });
          });
          return aurora_player.play();
        };
        return {
          open_new_file: function(blob, filename) {
            playing_started = new Date;
            if (this.playing) {
              this.pause();
            }
            if (aurora_player) {
              aurora_player.stop();
              aurora_player = null;
            }
            if (object_url) {
              URL.revokeObjectURL(object_url);
            }
            object_url = URL.createObjectURL(blob);
            if (filename.substr(0, -4) === 'alac') {
              return play_with_aurora();
            } else {
              player_element.src = object_url;
              player_element.load();
              this.file_loaded = true;
              player_element.play();
              return this.playing = true;
            }
          },
          play: function() {
            playing_started = new Date;
            if (aurora_player) {
              aurora_player.play();
            } else {
              player_element.play();
            }
            return this.playing = true;
          },
          pause: function() {
            if (aurora_player) {
              aurora_player.pause();
            } else {
              player_element.pause();
            }
            return this.playing = false;
          },
          seeking: function(percents) {
            if (aurora_player) {
              return aurora_player.seek(aurora_player.duration * percents / 100);
            } else if (player_element.duration) {
              player_element.pause();
              player_element.currentTime = player_element.duration * percents / 100;
              if (cs.bus.state.player === 'playing') {
                return player_element.play();
              } else {
                return _this.play();
              }
            }
          }
        };
      })();
      return this.play(null, function() {
        _this.play();
        return _this.player.currentTime = 0;
      });
    },
    play: function(id, callback) {
      var element, play_button,
        _this = this;
      id = !isNaN(parseInt(id)) ? id : void 0;
      if (typeof callback !== 'function') {
        callback = function() {};
      } else {
        callback.bind(this);
      }
      element = this;
      play_button = element.shadowRoot.querySelector('[icon=play]');
      if (this.player.file_loaded && !id) {
        if (this.player.playing) {
          this.player.pause();
          play_button.icon = 'play';
          cs.bus.trigger('player/pause');
          return cs.bus.state.player = 'paused';
        } else {
          this.player.play();
          play_button.icon = 'pause';
          cs.bus.trigger('player/resume');
          return cs.bus.state.player = 'playing';
        }
      } else if (id) {
        return music_library.get(id, function(data) {
          var get_file;
          get_file = music_storage.get(data.name);
          get_file.onsuccess = function() {
            var blob;
            blob = this.result;
            element.player.open_new_file(blob, data.name);
            (function() {
              var update_cover, update_cover_timeout;
              update_cover = function(cover) {
                var el;
                element.shadowRoot.querySelector('cs-cover').style.backgroundImage = cover ? "url(" + cover + ")" : 'none';
                if (cover) {
                  el = document.createElement('div');
                  el.style.backgroundImage = "url(" + cover + ")";
                  return new Blur({
                    el: el,
                    path: cover,
                    radius: 20,
                    callback: function() {
                      body.style.backgroundImage = el.style.backgroundImage;
                      return setTimeout((function() {
                        return URL.revokeObjectURL(cover);
                      }), 500);
                    }
                  });
                } else {
                  return body.style.backgroundImage = 'url(img/bg.jpg)';
                }
              };
              update_cover_timeout = setTimeout((function() {
                element.shadowRoot.querySelector('cs-cover').style.backgroundImage = 'none';
                return body.backgroundImage = "url(img/bg.jpg)";
              }), 500);
              return parseAudioMetadata(blob, function(metadata) {
                var cover;
                clearInterval(update_cover_timeout);
                cover = metadata.picture;
                if (cover) {
                  cover = URL.createObjectURL(cover);
                }
                return update_cover(cover);
              });
            })();
            play_button.icon = 'pause';
            cs.bus.trigger('player/play', id);
            cs.bus.state.player = 'playing';
            music_library.get_meta(id, function(data) {
              if (data) {
                element.title = data.title || _('unknown');
                element.artist = data.artist;
                if (data.artist && data.album) {
                  return element.artist += ": " + data.album;
                }
              } else {
                element.title = _('unknown');
                return element.artist = '';
              }
            });
            return callback();
          };
          return get_file.onerror = function(e) {
            return alert(_('cant-play-this-file', {
              error: e.target.error.name
            }));
          };
        });
      } else {
        return music_playlist.current(function(id) {
          return _this.play(id, callback);
        });
      }
    },
    prev: function(callback) {
      var _this = this;
      return music_playlist.prev(function(id) {
        return _this.play(id, callback);
      });
    },
    next: function(callback) {
      var _this = this;
      return music_playlist.next(function(id) {
        return _this.play(id, callback);
      });
    },
    menu: function() {
      return $(body).addClass('menu');
    },
    seeking: function(percents) {
      return this.player.seeking(percents);
    }
  });

}).call(this);
