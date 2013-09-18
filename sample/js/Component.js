Class(Kanji, {
  id: 'Component',
  type: 'shared',

  log: function() {
    this.notify('log:info', [].slice.call(arguments).join(' '));
  },

  /**
   * Main entry point
   */
  main: function(clazz) {
    // declare LI namespace if it's not available
    if (typeof LI !== 'object') {
      LI = {};
    }

    // bind Component under LI
    LI.Component = clazz;
  }
});