Class(Kanji, {
  id: 'Dialog',

  actions: {
    self: 'mouseenter:prefetch'
  },

  prefetch: function() {
  }
});

Class(Component, {
  id: 'LoginDialog',

  actions: {
    self: 'mousedown:showContextMenu'
  },

  showContextMenu: function() {
  }
});