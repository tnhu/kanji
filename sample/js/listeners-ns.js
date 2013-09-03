Class(Kanji, {
  id: 'Timer',

  init: function(container, config) {
    var th = this;

    this.$body  = $(document.body);
    this.config = config;

    setTimeout(function() {
      th.notify('time:up', +new Date(), config.src);
    }, 1000);
  },

  listeners: {
    'time:show': function() {
      $('<p style="color: magenta;">Source:' + this.config.src + '</p>').appendTo(this.$body);
    }
  }
});

Class(Kanji, {
  id: 'Listener',
  type: 'shared',

  init: function() {
    this.$body = $(document.body);
  },

  listeners: {
    /**
     * Listen to 'time:up' event on Sender with namespace 'red'
     */
    'time:up/red': function(date, from) {
      $('<p style="color: red;">Time:' + date + ' received from ' + from + '</p>').appendTo(this.$body);

      // notify Red Timers to show their source
      this.notify('time:show/red');
    },

    /**
     * Listen to 'time:up' event on all timers
     */
    'time:up': function(date, from) {
      $('<p>Time:' + date + ' received from ' + from + '</p>').appendTo(this.$body);
    }
  }
});