/* jshint newcap:false */
/* global Class, Kanji, console, LI, $, Image */

/**
 * ResourceLoader loads stylesheets, scripts, and images declared in data-cfg.
 *
 * @author Tan Nhu, http://lnkd.in/tnhu
 * @licence MIT
 * @dependency jsface, Kanji, jQuery
 */
Class(Kanji, {
  id  : 'ResourceLoader',
  type: 'shared',             /* one shared instance */
  lazy: false,

  init: function(element, config) {
    var type, i, len, items, url,
        head = $('head');

    //
    // TODO cache urls to make sure there's no duplication
    //
    for (type in config) {
      items = config[type];

      for (i = 0, len = items.length; i < len; i++) {
        url = items[i];

        switch (type) {
        case 'js':
          $.getScript(url);
          break;

        case 'css':
          head.append("<link rel='stylesheet' type='text/css' href='"  + url + "' />");
          break;

        case 'img':
          new Image().src = url;
          break;
        }
      }
    }
  }
});