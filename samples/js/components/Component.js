Class(Kanji, {
  componentId   : 'Component',
  componentType : 'shared',          /* by default, all inherit components are 'shared', change to 'instance' or remove to make it 'instance' */

  /**
   * Open a modal
   * @param button jQuery object represents target button element
   * @param container jQuery object represents component container
   * @param config JSON data passed speficied in button
   */
  onModal: function(button, container, config) {
    console.log('onModal called from Component: ', button, config, container);
  },

  /**
   * Fire a system event
   * @param button jQuery object represents target button element
   * @param container jQuery object represents component container
   * @param config JSON data passed speficied in button
   */
  onEvent: function(button, container, config) {
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