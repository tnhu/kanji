/* jshint newcap:false */
/* global Class, Kanji, console */

Class(LI.Component, {
  componentId   : 'Panel',

  /**
   * init is called when component's attached DOM element is ready
   * @param config configuration
   * @param element jQuery attached DOM object
   */
  init: function(config, element) {
    console.log('Execute panel init() with ', element, 'config', config);
  },

  onSend: function(button, container) {
    console.log("Panel:onSend", button, container);
  }
});