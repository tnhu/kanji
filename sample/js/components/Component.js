Class(Kanji, {
  componentId: 'Component',

  /**
   * Log a message
   * @param any
   */
  log: function() {
    var log = $("#log");
    $([ '<p>', [].slice.call(arguments).join(' '), '</p>' ].join('')).appendTo(log);

    log.animate({
      scrollTop:  log[0].scrollHeight
    }, 250);
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