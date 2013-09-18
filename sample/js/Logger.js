LI.Logger = Class(LI.Component, {
  id  : 'Logger',
  type: 'shared',
  lazy: false,

  init: function(container, config) {
    this.container = container;
  },

  /**
   * Log a message
   */
  log: function(msg) {
    var log = this.container;

    $([ '<p>', msg, '</p>' ].join('')).appendTo(log);

    log.animate({ scrollTop: log[0].scrollHeight }, 0);
  },

  /**
   * Listen to logging event
   */
  listeners: {
    'log:info': function(msg) {
      this.log(msg);
    },

    'log:debug': function() {
      var args = [].slice.call(arguments);

      args.unshift('DEBUG:');
      this.log.call(this, args.join(' '));
    },

    'log:error': function() {
      var args = [].slice.call(arguments);

      args.unshift('ERROR:');
      this.log.call(this, args.join(' '));
    }
  }
});