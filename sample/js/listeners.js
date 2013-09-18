Timer = Class(Kanji, {
  id: 'Timer',
  type: 'shared',
  lazy: false,

  init: function(container, config) {
    var th = this;

    console.log('Timer initialization');

    setInterval(function() {
        th.notify('time:up', +new Date(), config.src);
    }, 2000);
  }
});

Listener = Class(Kanji, {
  id: 'Listener',
  type: 'shared',
  lazy: false,

  init: function() {
    console.log('Listener initialization');
  },

  listeners: {
    'time:up': function(date, from) {
      var body = $(document.body);

      $('<p>Time:' + date + ' received from ' + from + '</p>').appendTo(body);
      body.animate({ scrollTop: body.height() + 'px' });
    }
  }
});
