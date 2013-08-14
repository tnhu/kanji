/* jshint newcap:false */
/* global Class, Kanji, console */

Class(LI.Component, {
  componentId   : 'Card',     // required
  componentType : 'shared',   // instance|shared (instance by default), optional

  constructor: function() {
    console.log('invoke constructor');
  },

  /**
   * init is called when component's attached DOM element is ready
   * @param config configuration
   * @param element jQuery attached DOM object
   */
  init: function(config, element) {
    console.log('Execute init() with ', element, 'config', config, 'type', typeof config);
  },

  onCheck: function(button, container) {
    console.log(button, container);
  }
});