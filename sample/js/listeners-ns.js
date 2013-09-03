Class(Kanji, {
  id: 'Timer',

  init: function(container, config) {
    var th = this;

    this.$body  = $(document.body);
    this.config = config;

    setInterval(function() {
      th.notify('time:up', +new Date(), config.src);
    }, 4000);
  },

  /*
   * when namespace is declared in a component (aka data-com="ComponentId/namespace'), sender must specify
   * namespace with event id to route to the correct destination.
   * For example Kanji.notify('time:show') notifies all Timer without namespace, Kanji.notify('time:show/red') notifies Red Timer
   */
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

      // notify Red Timer to show its source
      this.notify('time:show/red');
    },

    /**
     * Listen to 'time:up' event on Sender with namespace 'green'
     */
    'time:up/green': function(date, from) {
      $('<p style="color: green;">Time:' + date + ' received from ' + from + '</p>').appendTo(this.$body);
    },

    /**
     * Listen to 'time:up' event on Sender with namespace 'blue'
     */
    'time:up/blue': function(date, from) {
      $('<p style="color: blue;">Time:' + date + ' received from ' + from + '</p>').appendTo(this.$body);
    },

    /**
     * Listen to 'time:up' event on other senders
     */
    'time:up': function(date, from) {
      $('<p>Time:' + date + ' received from ' + from + '</p>').appendTo(this.$body);
    }
  }
});