Class(Kanji, {
  id: 'Timer',
  type: 'shared',

  init: function(container, config) {
    var th = this;

    setInterval(function() {
        th.notify('time:up', +new Date(), config.src);
    }, 2000);
  }
});

Class(Kanji, {
  id: 'Listener',
  type: 'shared',

  listeners: {
    'time:up': function(date, from) {
      var body = $(document.body);

      $('<p>Time:' + date + ' received from ' + from + '</p>').appendTo(body);
      body.animate({ scrollTop: body.height() + 'px' });
    }
  }
});
