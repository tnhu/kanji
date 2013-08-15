/* jshint newcap:false */
/* global Class, Kanji, console, LI, $, Image */

LI.ResourceLoader = Class(LI.Component, {
  componentId   : 'ResourceLoader',
  componentType : 'shared',

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
          console.log('Getting script', url);
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