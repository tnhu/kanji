/* jshint newcap:false */
/* global Class, Kanji, console */

Class(LI.Component, {
  componentId   : 'Page',

  /**
   * init is called when component's attached DOM element is ready
   * @param config configuration
   * @param element jQuery attached DOM object
   */
  init: function(config, element) {
    console.log('Page: do something on init', element, 'config', config);
  },

  onLogin: function(button, container) {
    console.log('Page: do something on login');
  }
});