Class(Kanji, {
  componentId: 'Component',

  /**
   * Open a modal
   * @param button jQuery object represents target button element
   * @param config JSON data passed speficied in button
   * @param container jQuery object represents component container
   */
  onModal: function(button, config, container) {
    console.log('onModal: ', button, config, container);
  },

  /**
   * Fire a system event
   * @param button jQuery object represents target button element
   * @param config JSON data passed speficied in button
   * @param container jQuery object represents component container
   */
  onEvent: function(button, config, container) {
    console.log('onEvent: ', button, config, container);
  },

  /**
   * Main entry point
   */
  main: function(clazz) {
    if (typeof LI !== 'object') {
      LI = {};
    }
    LI.Component = clazz;
  }
});