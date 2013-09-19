LI.Feedback = Class(LI.Component, {
  id: 'Feedback',

  actions: {
    '.name': 'keydown,keyup:checkingFeedback'
  },

  init: function(element, config) {
    this.log('Feeback: init');
  },

  checkingFeedback: function(event, input) {
    this.log('Feeback: onNameKeyup');
  }
});